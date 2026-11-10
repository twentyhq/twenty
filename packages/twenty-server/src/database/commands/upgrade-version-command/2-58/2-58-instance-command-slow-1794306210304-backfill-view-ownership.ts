import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

import { collapseViewVisibilityOverrides } from 'src/database/commands/upgrade-version-command/2-58/utils/collapse-view-visibility-overrides.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const VIEW_BACKFILL_BATCH_SIZE = 1000;

type StoredView = {
  id: string;
  visibility: string;
  overrides: unknown;
  ownerUserWorkspaceId: string | null;
  activeOwnerUserWorkspaceId: string | null;
  activeCreatorUserWorkspaceId: string | null;
  applicationUniversalIdentifier: string | null;
};

@RegisteredInstanceCommand('2.58.0', 1794306210304, { type: 'slow' })
export class BackfillViewOwnershipSlowInstanceCommand implements SlowInstanceCommand {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    let lastViewId: string | null = null;

    while (true) {
      const nextViewId = await dataSource.transaction(async (manager) => {
        const views: StoredView[] = await manager.query(
          `SELECT view."id", view."visibility", view."overrides", view."ownerUserWorkspaceId",
             application."universalIdentifier" AS "applicationUniversalIdentifier",
             creator."id" AS "activeCreatorUserWorkspaceId",
             owner."id" AS "activeOwnerUserWorkspaceId"
           FROM "core"."view" AS view
           LEFT JOIN "core"."application" AS application ON application."id" = view."applicationId"
           LEFT JOIN "core"."userWorkspace" AS creator
             ON creator."id" = view."createdByUserWorkspaceId"
             AND creator."workspaceId" = view."workspaceId" AND creator."deletedAt" IS NULL
           LEFT JOIN "core"."userWorkspace" AS owner
             ON owner."id" = view."ownerUserWorkspaceId"
             AND owner."workspaceId" = view."workspaceId" AND owner."deletedAt" IS NULL
           WHERE ($1::uuid IS NULL OR view."id" > $1::uuid)
           ORDER BY view."id" LIMIT $2 FOR UPDATE OF view`,
          [lastViewId, VIEW_BACKFILL_BATCH_SIZE],
        );

        if (views.length === 0) {
          return null;
        }

        const normalizedViews = views.map((view) => {
          const normalized = collapseViewVisibilityOverrides(view);

          if (
            normalized.visibility === 'UNLISTED' &&
            isDefined(view.ownerUserWorkspaceId) &&
            !isDefined(view.activeOwnerUserWorkspaceId)
          ) {
            throw new Error(
              `View ${view.id} has an inactive or cross-workspace owner`,
            );
          }

          return {
            id: view.id,
            ...normalized,
            ownerUserWorkspaceId:
              normalized.visibility === 'UNLISTED'
                ? (view.ownerUserWorkspaceId ??
                  view.activeCreatorUserWorkspaceId)
                : null,
          };
        });

        await manager.query(
          `UPDATE "core"."view" AS view
           SET "visibility" = normalized."visibility", "overrides" = normalized."overrides",
             "ownerUserWorkspaceId" = normalized."ownerUserWorkspaceId"
           FROM jsonb_to_recordset($1::jsonb) AS normalized(
             "id" uuid, "visibility" "core"."view_visibility_enum",
             "overrides" jsonb, "ownerUserWorkspaceId" uuid
           )
           WHERE view."id" = normalized."id"
             AND (view."visibility", view."overrides", view."ownerUserWorkspaceId")
               IS DISTINCT FROM (normalized."visibility", normalized."overrides", normalized."ownerUserWorkspaceId")`,
          [JSON.stringify(normalizedViews)],
        );

        return views[views.length - 1].id;
      });

      if (!isDefined(nextViewId)) {
        break;
      }

      lastViewId = nextViewId;
    }

    let lastWorkspaceId: string | null = null;

    while (true) {
      const workspaces: { workspaceId: string }[] = await dataSource.query(
        `SELECT DISTINCT "workspaceId" FROM "core"."view"
         WHERE ($1::uuid IS NULL OR "workspaceId" > $1::uuid)
         ORDER BY "workspaceId" LIMIT $2`,
        [lastWorkspaceId, VIEW_BACKFILL_BATCH_SIZE],
      );

      if (workspaces.length === 0) {
        break;
      }

      for (const { workspaceId } of workspaces) {
        const refresh = () =>
          this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
            'flatViewMaps',
            'flatViewFieldMaps',
            'flatViewFieldGroupMaps',
            'flatViewFilterMaps',
            'flatViewFilterGroupMaps',
            'flatViewSortMaps',
            'flatViewGroupMaps',
          ]);

        try {
          await refresh();
        } catch {
          await refresh();
        }
      }

      lastWorkspaceId = workspaces[workspaces.length - 1].workspaceId;
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_OWNER_PRIVATE_ONLY" CHECK (("ownerUserWorkspaceId" IS NULL OR "visibility" = \'UNLISTED\'))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const incompatibleViews: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."view" WHERE "visibility" = 'UNLISTED'
       AND "ownerUserWorkspaceId" IS DISTINCT FROM "createdByUserWorkspaceId" LIMIT 1`,
    );

    if (incompatibleViews.length > 0) {
      throw new Error(
        'Cannot restore creator-based access while private view ownership differs',
      );
    }

    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_OWNER_PRIVATE_ONLY"',
    );
  }
}

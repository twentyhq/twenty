import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Every other non-editable field is left alone: dropping a restriction only
// because a field is not editable would loosen permissions beyond the bug
const NON_EDITABLE_SYSTEM_FIELD_NAMES = [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
];

@RegisteredWorkspaceCommand('2.39.0', 1788531440100)
@Command({
  name: 'upgrade:2-39:clear-unrestrictable-field-permissions',
  description:
    'Clear field permissions the roles UI cannot represent: restrictions on the non-editable createdAt/updatedAt/deletedAt/createdBy fields, and read restrictions on label identifiers. Idempotent.',
})
export class ClearUnrestrictableFieldPermissionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    if (options.dryRun) {
      const [{ count }] = await this.coreDataSource.query<[{ count: string }]>(
        `SELECT count(*)::text AS count
         FROM "core"."fieldPermission" AS "fieldPermission"
         JOIN "core"."fieldMetadata" AS "fieldMetadata"
           ON "fieldMetadata"."id" = "fieldPermission"."fieldMetadataId"
         LEFT JOIN "core"."objectMetadata" AS "objectMetadata"
           ON "objectMetadata"."id" = "fieldPermission"."objectMetadataId"
         WHERE "fieldPermission"."workspaceId" = $1
           AND "fieldPermission"."applicationId" = $2
           AND (("fieldMetadata"."isUIEditable" = false
             AND "fieldMetadata"."name" = ANY($3::text[]))
             OR ("objectMetadata"."labelIdentifierFieldMetadataId" = "fieldPermission"."fieldMetadataId"
               AND "fieldPermission"."canReadFieldValue" = false))`,
        [
          workspaceId,
          workspaceCustomFlatApplication.id,
          NON_EDITABLE_SYSTEM_FIELD_NAMES,
        ],
      );

      this.logger.log(
        `[DRY RUN] Would clear ${count} unrestrictable field permission(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const deletedOnNonEditableFields = await this.coreDataSource.query<
      unknown[]
    >(
      `DELETE FROM "core"."fieldPermission" AS "fieldPermission"
       USING "core"."fieldMetadata" AS "fieldMetadata"
       WHERE "fieldMetadata"."id" = "fieldPermission"."fieldMetadataId"
         AND "fieldPermission"."workspaceId" = $1
         AND "fieldPermission"."applicationId" = $2
         AND "fieldMetadata"."isUIEditable" = false
         AND "fieldMetadata"."name" = ANY($3::text[])
       RETURNING "fieldPermission"."id"`,
      [
        workspaceId,
        workspaceCustomFlatApplication.id,
        NON_EDITABLE_SYSTEM_FIELD_NAMES,
      ],
    );

    const clearedOnLabelIdentifiers = await this.coreDataSource.query<
      unknown[]
    >(
      `WITH "cleared" AS (
         UPDATE "core"."fieldPermission" AS "fieldPermission"
         SET "canReadFieldValue" = NULL, "updatedAt" = now()
         FROM "core"."objectMetadata" AS "objectMetadata"
         WHERE "objectMetadata"."id" = "fieldPermission"."objectMetadataId"
           AND "objectMetadata"."labelIdentifierFieldMetadataId" = "fieldPermission"."fieldMetadataId"
           AND "fieldPermission"."workspaceId" = $1
           AND "fieldPermission"."applicationId" = $2
           AND "fieldPermission"."canReadFieldValue" = false
         RETURNING "fieldPermission"."id", "fieldPermission"."canUpdateFieldValue"
       ), "deleted" AS (
         DELETE FROM "core"."fieldPermission"
         WHERE "id" IN (
           SELECT "id" FROM "cleared" WHERE "canUpdateFieldValue" IS NULL
         )
       )
       SELECT "id" FROM "cleared"`,
      [workspaceId, workspaceCustomFlatApplication.id],
    );

    if (
      deletedOnNonEditableFields.length === 0 &&
      clearedOnLabelIdentifiers.length === 0
    ) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ]);

    this.logger.log(
      `Deleted ${deletedOnNonEditableFields.length} field permission(s) on non-editable system fields and cleared read on ${clearedOnLabelIdentifiers.length} label identifier(s) for workspace ${workspaceId}`,
    );
  }
}

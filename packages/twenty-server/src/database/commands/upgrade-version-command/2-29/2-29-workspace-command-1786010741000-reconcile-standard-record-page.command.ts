import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getSystemRecordPageLayoutUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-29/constants/pre-2-29-standard-record-page-layout-universal-identifier-by-object-universal-identifier.constant';
import { applyRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/utils/apply-record-page-reown-updates.util';
import { collectRecordPageStackFlatEntities } from 'src/database/commands/upgrade-version-command/2-29/utils/collect-record-page-stack-flat-entities.util';
import { computeRecordPageStackReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/utils/compute-record-page-stack-reown-updates.util';
import { countRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/utils/count-record-page-reown-updates.util';
import { createEmptyRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/utils/create-empty-record-page-reown-updates.util';
import { type RecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/types/record-page-reown-updates.type';
import { computeRecordPageReconcileFlatEntityMapsKeys } from 'src/database/commands/upgrade-version-command/2-29/utils/compute-record-page-reconcile-flat-entity-maps-keys.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.29.0', 1786010741000)
@Command({
  name: 'upgrade:2-29:reconcile-standard-record-page',
  description:
    'Normalize the twenty-standard-owned record-page rows. Only the standard sync and the 1-23 backfill ever authored rows under twenty-standard, so per object there is at most one RECORD_PAGE layout by construction and no winner selection is ever needed. Two passes. (1) For every standard object, the curated layout is located by its pre-2.29 pinned literal (or by the derived identifier on a rerun) and its whole stack (tabs, widgets, the FIELDS widget view plus the reserved FIELDS_WIDGET key backfill, its view fields keyed on the displayed field application, standard-authored groups) is re-owned onto the name-free derived scheme and flagged isSystemSideEffect. App-authored tabs attached to the standard layout (e.g. fireflies, call-recorder) are left untouched. (2) The 1-23 backfill authored the record-page stacks of workspace-custom objects under twenty-standard: those stacks are de-owned, i.e. their applicationId moves to the workspace-custom application without touching identifiers, so that the workspace-custom reconcile command running next treats one homogeneous population per custom object. Standard-owned layouts matching neither pass (unknown row on a standard object, layout on an app object) are logged and left untouched. universalIdentifier is unique per workspace, so any derived identifier already held by another row is skipped with a warning instead of aborting the transaction. Objects missing the stack entirely get it from the backfill-record-page command.',
})
export class ReconcileStandardRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const reownUpdates = this.computeCuratedStackReownUpdates({
      workspaceId,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    });

    this.appendDeOwnUpdates({
      workspaceId,
      reownUpdates,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      workspaceCustomApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceCustomApplicationId: workspaceCustomFlatApplication.id,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatObjectMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    });

    const totalUpdateCount = countRecordPageReownUpdates(reownUpdates);

    if (totalUpdateCount === 0) {
      this.logger.log(
        `No standard record-page stack to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling standard record-page stacks for workspace ${workspaceId} (${totalUpdateCount} row(s))`,
    );

    if (isDryRun) {
      return;
    }

    await applyRecordPageReownUpdates({
      manager: this.viewRepository.manager,
      workspaceId,
      reownUpdates,
    });

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: computeRecordPageReconcileFlatEntityMapsKeys(),
      workspaceId,
    });

    this.logger.log(
      `Reconciled standard record-page stacks for workspace ${workspaceId} (${totalUpdateCount} row(s))`,
    );
  }

  // Pass 1: for every standard object, locate the curated layout by its
  // pre-2.29 pinned literal (or the derived identifier on a rerun) and re-own
  // its whole stack onto the derived scheme.
  private computeCuratedStackReownUpdates({
    workspaceId,
    twentyStandardApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  }: {
    workspaceId: string;
    twentyStandardApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'flatPageLayoutMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): RecordPageReownUpdates {
    const reownUpdates = createEmptyRecordPageReownUpdates();
    const engineOwnedApplicationUniversalIdentifiers = new Set([
      twentyStandardApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    ]);

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatObjectMetadata) ||
        flatObjectMetadata.applicationUniversalIdentifier !==
          twentyStandardApplicationUniversalIdentifier
      ) {
        continue;
      }

      const pre228LayoutUniversalIdentifier =
        PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER[
          flatObjectMetadata.universalIdentifier
        ];
      const derivedPageLayoutUniversalIdentifier =
        getSystemRecordPageLayoutUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            twentyStandardApplicationUniversalIdentifier,
          objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        });

      const flatPageLayout = isDefined(pre228LayoutUniversalIdentifier)
        ? (flatPageLayoutMaps.byUniversalIdentifier[
            pre228LayoutUniversalIdentifier
          ] ??
          flatPageLayoutMaps.byUniversalIdentifier[
            derivedPageLayoutUniversalIdentifier
          ])
        : flatPageLayoutMaps.byUniversalIdentifier[
            derivedPageLayoutUniversalIdentifier
          ];

      if (!isDefined(flatPageLayout) || isDefined(flatPageLayout.deletedAt)) {
        continue;
      }

      if (
        flatPageLayout.applicationUniversalIdentifier !==
          twentyStandardApplicationUniversalIdentifier ||
        flatPageLayout.type !== PageLayoutType.RECORD_PAGE ||
        flatPageLayout.objectMetadataUniversalIdentifier !==
          flatObjectMetadata.universalIdentifier
      ) {
        this.logger.warn(
          `Layout ${flatPageLayout.id} does not match the expected curated record-page stack of standard object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const stackReownUpdates = computeRecordPageStackReownUpdates({
        workspaceId,
        logger: this.logger,
        flatObjectMetadata,
        flatPageLayout,
        derivedPageLayoutUniversalIdentifier,
        engineOwnedApplicationUniversalIdentifiers,
        twentyStandardApplicationUniversalIdentifier,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatFieldMetadataMaps,
        flatPageLayoutMaps,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      });

      this.mergeReownUpdates(reownUpdates, stackReownUpdates);
    }

    return reownUpdates;
  }

  // Pass 2: the 1-23 backfill authored the record-page stacks of
  // workspace-custom objects under twenty-standard; move their applicationId
  // to workspace-custom (identifiers untouched, the workspace-custom
  // reconcile command re-owns them next).
  private appendDeOwnUpdates({
    workspaceId,
    reownUpdates,
    twentyStandardApplicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    workspaceCustomApplicationId,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatObjectMetadataMaps,
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  }: {
    workspaceId: string;
    reownUpdates: RecordPageReownUpdates;
    twentyStandardApplicationUniversalIdentifier: string;
    workspaceCustomApplicationUniversalIdentifier: string;
    workspaceCustomApplicationId: string;
  } & Pick<
    AllFlatEntityMaps,
    | 'flatViewMaps'
    | 'flatViewFieldMaps'
    | 'flatViewFieldGroupMaps'
    | 'flatObjectMetadataMaps'
    | 'flatPageLayoutMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
  >): void {
    for (const flatPageLayout of Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatPageLayout) ||
        flatPageLayout.type !== PageLayoutType.RECORD_PAGE ||
        isDefined(flatPageLayout.deletedAt) ||
        flatPageLayout.applicationUniversalIdentifier !==
          twentyStandardApplicationUniversalIdentifier ||
        !isDefined(flatPageLayout.objectMetadataUniversalIdentifier)
      ) {
        continue;
      }

      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          flatPageLayout.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Missing object for standard-owned record-page layout ${flatPageLayout.id} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      if (
        flatObjectMetadata.applicationUniversalIdentifier ===
        twentyStandardApplicationUniversalIdentifier
      ) {
        const expectedLayoutUniversalIdentifiers = [
          PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER[
            flatObjectMetadata.universalIdentifier
          ],
          getSystemRecordPageLayoutUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              twentyStandardApplicationUniversalIdentifier,
            objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          }),
        ].filter(isDefined);

        if (
          !expectedLayoutUniversalIdentifiers.includes(
            flatPageLayout.universalIdentifier,
          )
        ) {
          this.logger.warn(
            `Standard-owned record-page layout ${flatPageLayout.id} on standard object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId} matches neither the pre-2.29 literal nor the derived identifier, skipping`,
          );
        }
        continue;
      }

      // Layouts of app objects were never authored under twenty-standard;
      // anything found there is an anomaly, not a 1-23 backfill row.
      if (
        flatObjectMetadata.applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier
      ) {
        this.logger.warn(
          `Standard-owned record-page layout ${flatPageLayout.id} is attached to app object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      const stack = collectRecordPageStackFlatEntities({
        flatPageLayout,
        flatViewMaps,
        flatViewFieldMaps,
        flatViewFieldGroupMaps,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      });

      const stackBuckets = [
        [stack.pageLayouts, reownUpdates.pageLayoutUpdates],
        [stack.pageLayoutTabs, reownUpdates.pageLayoutTabUpdates],
        [stack.pageLayoutWidgets, reownUpdates.pageLayoutWidgetUpdates],
        [stack.views, reownUpdates.viewUpdates],
        [stack.viewFields, reownUpdates.viewFieldUpdates],
        [stack.viewFieldGroups, reownUpdates.viewFieldGroupUpdates],
      ] as const;

      for (const [flatEntities, updates] of stackBuckets) {
        for (const flatEntity of flatEntities) {
          if (
            flatEntity.applicationUniversalIdentifier !==
            twentyStandardApplicationUniversalIdentifier
          ) {
            continue;
          }

          updates.push({
            id: flatEntity.id,
            update: { applicationId: workspaceCustomApplicationId },
          });
        }
      }
    }
  }

  private mergeReownUpdates(
    target: RecordPageReownUpdates,
    source: RecordPageReownUpdates,
  ): void {
    for (const key of Object.keys(source) as (keyof RecordPageReownUpdates)[]) {
      target[key].push(...source[key]);
    }
  }
}

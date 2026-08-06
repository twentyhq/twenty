import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { getSystemRecordPageLayoutUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { applyRecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/utils/apply-record-page-reown-updates.util';
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

type FlatPageLayoutCandidate = NonNullable<
  AllFlatEntityMaps['flatPageLayoutMaps']['byUniversalIdentifier'][string]
>;

@RegisteredWorkspaceCommand('2.29.0', 1786010741500)
@Command({
  name: 'upgrade:2-29:reconcile-workspace-custom-record-page',
  description:
    'Re-own the system record-page stack of every workspace-custom object onto the engine convention. Runs after reconcile-standard-record-page de-owned the 1-23-era stacks onto workspace-custom, so per custom object the workspace-custom RECORD_PAGE layouts are one homogeneous population: the system stack (1-23 backfill or the incremental createOneObject path, whose pre-2-15 rows are stuck at isSystemSideEffect false because the 2-15 column landed with default false and no backfill) plus, theoretically, API-created custom layouts. The system stack per object is resolved by a decision table, never by scoring: a single candidate is the system stack; among several, a single isSystemSideEffect candidate wins (the engine wrote that flag); anything still ambiguous is logged and skipped, the backfill command provisions the derived stack next and the untouched layouts keep working as caller customs. The winner stack (tabs, widgets, the FIELDS widget view plus the reserved FIELDS_WIDGET key backfill, its view fields keyed on the displayed field application) is re-owned onto the name-free derived scheme and flagged isSystemSideEffect. App-authored rows are left untouched, and derived identifiers already held by another row are skipped with a warning instead of aborting the transaction.',
})
export class ReconcileWorkspaceCustomRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
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

    const reownUpdates = this.computeReownUpdates({
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

    const totalUpdateCount = countRecordPageReownUpdates(reownUpdates);

    if (totalUpdateCount === 0) {
      this.logger.log(
        `No workspace-custom record-page stack to reconcile for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Reconciling workspace-custom record-page stacks for workspace ${workspaceId} (${totalUpdateCount} row(s))`,
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
      `Reconciled workspace-custom record-page stacks for workspace ${workspaceId} (${totalUpdateCount} row(s))`,
    );
  }

  private computeReownUpdates({
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

    const candidatesByObjectUniversalIdentifier = new Map<
      string,
      FlatPageLayoutCandidate[]
    >();

    for (const flatPageLayout of Object.values(
      flatPageLayoutMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatPageLayout) ||
        flatPageLayout.type !== PageLayoutType.RECORD_PAGE ||
        isDefined(flatPageLayout.deletedAt) ||
        flatPageLayout.applicationUniversalIdentifier !==
          workspaceCustomApplicationUniversalIdentifier ||
        !isDefined(flatPageLayout.objectMetadataUniversalIdentifier)
      ) {
        continue;
      }

      const candidates =
        candidatesByObjectUniversalIdentifier.get(
          flatPageLayout.objectMetadataUniversalIdentifier,
        ) ?? [];

      candidates.push(flatPageLayout);
      candidatesByObjectUniversalIdentifier.set(
        flatPageLayout.objectMetadataUniversalIdentifier,
        candidates,
      );
    }

    for (const [
      objectMetadataUniversalIdentifier,
      candidates,
    ] of candidatesByObjectUniversalIdentifier) {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          objectMetadataUniversalIdentifier
        ];

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Missing object for record-page layout(s) ${candidates
            .map((flatPageLayout) => flatPageLayout.id)
            .join(', ')} in workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      // Workspace-custom layouts on standard or app objects are caller
      // customs by definition (the system stack of those objects is owned by
      // their own application) and are never re-owned.
      if (
        flatObjectMetadata.applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier
      ) {
        continue;
      }

      const systemStackFlatPageLayout = this.resolveSystemStackFlatPageLayout({
        workspaceId,
        flatObjectMetadata,
        candidates,
      });

      if (!isDefined(systemStackFlatPageLayout)) {
        continue;
      }

      const stackReownUpdates = computeRecordPageStackReownUpdates({
        workspaceId,
        logger: this.logger,
        flatObjectMetadata,
        flatPageLayout: systemStackFlatPageLayout,
        derivedPageLayoutUniversalIdentifier:
          getSystemRecordPageLayoutUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              flatObjectMetadata.applicationUniversalIdentifier,
            objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          }),
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

      for (const key of Object.keys(
        stackReownUpdates,
      ) as (keyof RecordPageReownUpdates)[]) {
        reownUpdates[key].push(...stackReownUpdates[key]);
      }
    }

    return reownUpdates;
  }

  // The decision table: a single candidate is the system stack; among
  // several, a single isSystemSideEffect candidate wins (the engine wrote
  // that flag); anything still ambiguous is skipped, never scored.
  private resolveSystemStackFlatPageLayout({
    workspaceId,
    flatObjectMetadata,
    candidates,
  }: {
    workspaceId: string;
    flatObjectMetadata: NonNullable<
      AllFlatEntityMaps['flatObjectMetadataMaps']['byUniversalIdentifier'][string]
    >;
    candidates: FlatPageLayoutCandidate[];
  }): FlatPageLayoutCandidate | undefined {
    if (candidates.length === 1) {
      return candidates[0];
    }

    const flaggedCandidates = candidates.filter(
      (flatPageLayout) => flatPageLayout.isSystemSideEffect,
    );

    if (flaggedCandidates.length === 1) {
      const systemStackFlatPageLayout = flaggedCandidates[0];

      for (const flatPageLayout of candidates) {
        if (flatPageLayout.id === systemStackFlatPageLayout.id) {
          continue;
        }

        this.logger.warn(
          `Record-page layout ${flatPageLayout.id} on object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId} stays a caller custom, the system-flagged layout ${systemStackFlatPageLayout.id} is the system stack`,
        );
      }

      return systemStackFlatPageLayout;
    }

    this.logger.warn(
      `Ambiguous record-page layouts ${candidates
        .map((flatPageLayout) => flatPageLayout.id)
        .join(', ')} on object ${flatObjectMetadata.universalIdentifier} in workspace ${workspaceId}, skipping object`,
    );

    return undefined;
  }
}

import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findApplicationViewFieldIdsOnForeignViews } from 'src/database/commands/upgrade-version-command/2-61/utils/find-application-view-field-ids-on-foreign-views.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.61.0', 1795121785907)
@Command({
  name: 'upgrade:2-61:reown-application-view-fields-on-foreign-views',
  description:
    'Move the view fields a third-party application created on views it does not own to the workspace custom application. Manifest syncs no longer create such view fields (the app only suggests them), so the next sync would otherwise delete them. Once re-owned they are regular user columns. Engine-owned view fields and view fields of the twenty-standard and workspace-custom applications are left untouched. Idempotent: a re-owned view field belongs to the workspace custom application and is skipped on a second run.',
})
export class ReownApplicationViewFieldsOnForeignViewsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly applicationService: ApplicationService,
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
      ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const viewFieldIdsToReown = findApplicationViewFieldIdsOnForeignViews({
      flatViewFields: Object.values(
        flatViewFieldMaps.byUniversalIdentifier,
      ).filter(isDefined),
      flatViewByUniversalIdentifier: flatViewMaps.byUniversalIdentifier,
      engineOwnedApplicationUniversalIdentifiers: new Set([
        twentyStandardFlatApplication.universalIdentifier,
        workspaceCustomFlatApplication.universalIdentifier,
      ]),
    });

    if (viewFieldIdsToReown.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: moving ${viewFieldIdsToReown.length} application view field(s) on foreign views to the workspace custom application`,
    );

    if (options.dryRun) {
      return;
    }

    await this.viewFieldRepository.update(
      { id: In(viewFieldIdsToReown), workspaceId },
      { applicationId: workspaceCustomFlatApplication.id },
    );

    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [
        ...new Set(
          [
            'viewField' as const,
            ...getMetadataRelatedMetadataNames('viewField'),
          ].map(getMetadataFlatEntityMapsKey),
        ),
      ],
      workspaceId,
    });
  }
}

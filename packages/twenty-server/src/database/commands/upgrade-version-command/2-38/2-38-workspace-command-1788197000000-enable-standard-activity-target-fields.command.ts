import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ACTIVITY_TARGET_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.company.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.company.fields.noteTargets.universalIdentifier,
  STANDARD_OBJECTS.person.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier,
  STANDARD_OBJECTS.opportunity.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.opportunity.fields.noteTargets.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.38.0', 1788197000000)
@Command({
  name: 'upgrade:2-38:enable-standard-activity-target-fields',
  description:
    'Make the standard company, person, and opportunity task/note target fields editable in the generic record UI',
})
export class EnableStandardActivityTargetFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would make standard activity target fields editable for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const updateResult = await dataSource.query<[unknown[], number]>(
      `UPDATE "core"."fieldMetadata"
       SET "isUIEditable" = true, "updatedAt" = now()
       WHERE "workspaceId" = $1
         AND "applicationId" = $2
         AND "universalIdentifier" = ANY($3::uuid[])
         AND "isUIEditable" = false`,
      [
        workspaceId,
        twentyStandardFlatApplication.id,
        ACTIVITY_TARGET_FIELD_UNIVERSAL_IDENTIFIERS,
      ],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);

    this.logger.log(
      `Made ${updateResult[1]} standard activity target field(s) editable for workspace ${workspaceId}`,
    );
  }
}

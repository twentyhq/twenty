import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { AggregateOperations } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MEMBERS_NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.views.messageListRecordPageMembers.viewFields.name
    .universalIdentifier;

@RegisteredWorkspaceCommand('2.48.0', 1791977057418)
@Command({
  name: 'upgrade:2-48:count-message-list-members',
  description:
    'Show the member count under the members table of message list record pages',
})
export class CountMessageListMembersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setMembersAggregateOperation({
      ...args,
      from: null,
      to: AggregateOperations.COUNT,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setMembersAggregateOperation({
      ...args,
      from: AggregateOperations.COUNT,
      to: null,
    });
  }

  private async setMembersAggregateOperation({
    workspaceId,
    options,
    from,
    to,
  }: RunOnWorkspaceArgs & {
    from: AggregateOperations | null;
    to: AggregateOperations | null;
  }): Promise<void> {
    const { flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewFieldMaps',
      ]);

    const membersNameViewField =
      flatViewFieldMaps.byUniversalIdentifier[
        MEMBERS_NAME_VIEW_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(membersNameViewField) ||
      membersNameViewField.aggregateOperation !== from
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: setting the message list members aggregate to ${to ?? 'none'}`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...membersNameViewField,
                  aggregateOperation: to,
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}

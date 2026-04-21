import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { CommandLogger } from 'src/database/commands/logger';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

type RebuildDefaultPackageFilesCommandOptions = {
  workspaceId?: Set<string>;
};

@Command({
  name: 'application:rebuild-default-package-files',
  description:
    'Re-upload default package.json and yarn.lock to file storage for all applications in the workspace',
})
export class RebuildDefaultPackageFilesCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    private readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all active/suspended workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(val: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(val);

    return accumulator;
  }

  override async run(
    _passedParams: string[],
    options: RebuildDefaultPackageFilesCommandOptions,
  ): Promise<void> {
    try {
      await this.workspaceIteratorService.iterate({
        workspaceIds: isDefined(options.workspaceId)
          ? Array.from(options.workspaceId)
          : undefined,
        callback: async ({ workspaceId }) => {
          const applications =
            await this.applicationService.findManyApplications(workspaceId);

          this.logger.log(
            `Found ${applications.length} application(s) in workspace ${workspaceId}`,
          );

          for (const application of applications) {
            try {
              await this.applicationService.uploadDefaultPackageFilesAndSetFileIds(
                application,
              );
              this.logger.log(
                `Rebuilt default package files for application "${application.name}" (${application.id})`,
              );
            } catch (error) {
              this.logger.error(
                `Failed to rebuild package files for application "${application.name}" (${application.id}): ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }
        },
      });

      this.logger.log(chalk.blue('Command completed!'));
    } catch (error) {
      this.logger.error(chalk.red(`Command failed`));
      throw error;
    }
  }
}

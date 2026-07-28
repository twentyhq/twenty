import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { parseBoundedPositiveInteger } from 'src/database/commands/utils/parse-bounded-positive-integer.util';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

type InstallApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  workspaceId?: Set<string>;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  yes?: boolean;
};

const MAX_WORKSPACE_COUNT_LIMIT = 50;

@Command({
  name: 'application:install',
  description:
    'Install an application on every workspace that does not have it yet. Workspaces where it is already installed are left untouched, use application:upgrade for those',
})
export class InstallApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags:
      '-u, --application-registration-universal-identifier <application_registration_universal_identifier>',
    description: 'Application registration universal identifier',
    required: true,
  })
  parseApplicationRegistrationUniversalIdentifier(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description:
      'Only install on the given workspace id. Can be repeated to target several workspaces. Targets all provisioned workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '--workspace-count-limit <count>',
    description: `Limit the number of workspaces to install on (max ${MAX_WORKSPACE_COUNT_LIMIT})`,
    required: false,
  })
  parseWorkspaceCountLimit(value: string): number {
    return parseBoundedPositiveInteger(
      value,
      'workspace count limit',
      MAX_WORKSPACE_COUNT_LIMIT,
    );
  }

  @Option({
    flags: '-d, --dry-run',
    description:
      'List the workspaces that would be installed without installing',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-y, --yes',
    description: 'Skip the confirmation prompt (for non-interactive usage)',
    required: false,
  })
  parseYes(): boolean {
    return true;
  }

  override async run(
    _passedParams: string[],
    options: InstallApplicationCommandOptions,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: {
        universalIdentifier: options.applicationRegistrationUniversalIdentifier,
      },
    });

    if (!isDefined(registration)) {
      throw new Error(
        `Application registration with universal identifier ${options.applicationRegistrationUniversalIdentifier} not found`,
      );
    }

    if (
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      registration.sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new Error(
        `Cannot install application ${registration.universalIdentifier}: applications with source type ${registration.sourceType} have no code artifacts to install`,
      );
    }

    const targetVersion = registration.latestAvailableVersion;
    const versionLabel = targetVersion ?? 'latest available';

    const workspaceIds = isDefined(options.workspaceId)
      ? Array.from(options.workspaceId)
      : undefined;

    const isDryRun = options.dryRun ?? false;

    if (!isDryRun && !(options.yes ?? false)) {
      const confirmationTarget = isDefined(workspaceIds)
        ? `workspace(s) ${workspaceIds.join(', ')}`
        : 'every provisioned workspace that does not have it yet';

      const isConfirmed = await askCommandConfirmation(
        `Confirm installing application ${registration.universalIdentifier} version ${versionLabel} on ${confirmationTarget}`,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, no installation performed');

        return;
      }
    }

    const alreadyInstalledWorkspaceIds =
      await this.findAlreadyInstalledWorkspaceIds(
        registration.universalIdentifier,
      );

    let skippedWorkspaceCount = 0;

    const report = await this.workspaceIteratorService.iterate({
      workspaceIds,
      workspaceCountLimit: options.workspaceCountLimit,
      dryRun: isDryRun,
      callback: async ({ workspaceId }) => {
        if (alreadyInstalledWorkspaceIds.has(workspaceId)) {
          skippedWorkspaceCount += 1;

          this.logger.log(
            `Skipping workspace ${workspaceId}: "${registration.name}" is already installed, run application:upgrade to update it`,
          );

          return;
        }

        if (isDryRun) {
          this.logger.log(
            `[DRY RUN] Would install "${registration.name}" (${registration.universalIdentifier}) version ${versionLabel} on workspace ${workspaceId}`,
          );

          return;
        }

        await this.applicationInstallService.installApplication({
          appRegistrationId: registration.id,
          version: targetVersion ?? undefined,
          workspaceId,
        });
      },
    });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Installed on ${report.success.length - skippedWorkspaceCount} workspace(s), skipped ${skippedWorkspaceCount} already installed, ${report.fail.length} failed`,
    );

    this.logger.log(chalk.blue('Command completed!'));
  }

  // Matches on the universal identifier, the same identity
  // ApplicationInstallService uses to decide between a fresh install and a
  // version upgrade, so a row with a stale registration id is not mistaken
  // for a missing installation.
  private async findAlreadyInstalledWorkspaceIds(
    universalIdentifier: string,
  ): Promise<Set<string>> {
    const existingApplications = await this.applicationRepository.find({
      select: ['workspaceId'],
      where: { universalIdentifier },
    });

    return new Set(
      existingApplications.map((application) => application.workspaceId),
    );
  }
}

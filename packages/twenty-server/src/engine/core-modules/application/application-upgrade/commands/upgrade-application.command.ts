import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';

type UpgradeApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  batchSize?: number;
  workspaceId?: Set<string>;
  workspaceCountLimit?: number;
  dryRun?: boolean;
};

@Command({
  name: 'upgrade-application',
  description:
    'Upgrade an application to its latest available version on every workspace that already has it installed',
})
export class UpgradeApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationUpgradeService: ApplicationUpgradeService,
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
    flags: '-b, --batch-size <batch_size>',
    description: 'Number of workspaces upgraded in parallel (defaults to 5)',
    required: false,
  })
  parseBatchSize(value: string): number {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
      throw new Error(
        `Invalid batch size "${value}". Expected a positive integer`,
      );
    }

    return parsedValue;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'Only upgrade the given workspace id. Can be repeated to target several workspaces. Upgrades all workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '--workspace-count-limit [count]',
    description: 'Limit the number of workspaces to upgrade',
    required: false,
  })
  parseWorkspaceCountLimit(value: string): number {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
      throw new Error(
        `Invalid workspace count limit "${value}". Expected a positive integer`,
      );
    }

    return parsedValue;
  }

  @Option({
    flags: '-d, --dry-run',
    description: 'List the workspaces that would be upgraded without upgrading',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  override async run(
    _passedParams: string[],
    options: UpgradeApplicationCommandOptions,
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

    const workspaceIds = isDefined(options.workspaceId)
      ? Array.from(options.workspaceId)
      : undefined;

    const { targetVersion, applicationsToUpgrade } =
      await this.applicationUpgradeService.findApplicationsToUpgrade({
        applicationRegistrationId: registration.id,
        onlyAutoUpgrade: false,
        workspaceIds,
        workspaceCountLimit: options.workspaceCountLimit,
      });

    if (!isDefined(targetVersion)) {
      this.logger.warn(
        `Application "${registration.name}" (${registration.universalIdentifier}) has no latest available version, nothing to upgrade`,
      );

      return;
    }

    const impactedWorkspaceIds = applicationsToUpgrade.map(
      (application) => application.workspaceId,
    );

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would upgrade "${registration.name}" (${registration.universalIdentifier}) to version ${targetVersion} on ${impactedWorkspaceIds.length} workspace(s)${
          impactedWorkspaceIds.length > 0
            ? `: ${impactedWorkspaceIds.join(', ')}`
            : ''
        }`,
      );

      return;
    }

    if (impactedWorkspaceIds.length === 0) {
      this.logger.log(
        `No workspace to upgrade, every targeted installation of "${registration.name}" already runs version ${targetVersion}`,
      );

      return;
    }

    const confirmationTarget = isDefined(workspaceIds)
      ? `workspace(s) ${workspaceIds.join(', ')}`
      : `${impactedWorkspaceIds.length} workspace(s)`;

    const isConfirmed = await askCommandConfirmation(
      `Confirm upgrading application ${registration.universalIdentifier} to version ${targetVersion} on ${confirmationTarget}`,
    );

    if (!isConfirmed) {
      this.logger.log('Aborted, no upgrade performed');

      return;
    }

    this.logger.log(
      `Upgrading "${registration.name}" (${registration.universalIdentifier}) to version ${targetVersion} on ${impactedWorkspaceIds.length} workspace(s)...`,
    );

    await this.applicationUpgradeService.upgradeAllApplications({
      applicationRegistrationId: registration.id,
      onlyAutoUpgrade: false,
      batchSize: options.batchSize,
      workspaceIds,
      workspaceCountLimit: options.workspaceCountLimit,
    });

    this.logger.log(chalk.blue('Command completed!'));
  }
}

import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';

const ROLLOUT_MODES = ['install', 'upgrade'] as const;

type RolloutMode = (typeof ROLLOUT_MODES)[number];

type RolloutApplicationCommandOptions = {
  applicationRegistrationId: string;
  mode: RolloutMode;
  batchSize?: number;
};

@Command({
  name: 'application:rollout',
  description:
    'Roll out an application registration across all existing workspaces. Mode "install" installs the latest version on every workspace (requires the registration to be flagged isPreInstalled); mode "upgrade" upgrades it to the latest available version on workspaces that already have it installed.',
})
export class RolloutApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly preInstalledAppsService: PreInstalledAppsService,
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-a, --application-registration-id <application_registration_id>',
    description: 'Application registration id (visible in the admin panel)',
    required: true,
  })
  parseApplicationRegistrationId(value: string): string {
    return value;
  }

  @Option({
    flags: '-m, --mode <mode>',
    description:
      '"install" to install on all workspaces, "upgrade" to upgrade existing installations to the latest version',
    required: true,
  })
  parseMode(value: string): RolloutMode {
    if (!ROLLOUT_MODES.includes(value as RolloutMode)) {
      throw new Error(
        `Invalid mode "${value}". Expected one of: ${ROLLOUT_MODES.join(', ')}`,
      );
    }

    return value as RolloutMode;
  }

  @Option({
    flags: '-b, --batch-size <batch_size>',
    description:
      'Number of workspaces upgraded in parallel (upgrade mode only, defaults to 5)',
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

  override async run(
    _passedParams: string[],
    options: RolloutApplicationCommandOptions,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: options.applicationRegistrationId },
    });

    if (!isDefined(registration)) {
      throw new Error(
        `Application registration ${options.applicationRegistrationId} not found`,
      );
    }

    if (options.mode === 'install') {
      if (!registration.isPreInstalled) {
        throw new Error(
          `Application "${registration.name}" is not flagged as pre-installed. Enable pre-install in the admin panel first.`,
        );
      }

      this.logger.log(
        `Installing "${registration.name}" (${registration.id}) on all existing workspaces...`,
      );

      await this.preInstalledAppsService.backfillApplicationOnAllWorkspaces(
        registration.id,
      );
    } else {
      if (!isDefined(registration.latestAvailableVersion)) {
        this.logger.warn(
          `Application "${registration.name}" (${registration.id}) has no latest available version, nothing to upgrade`,
        );

        return;
      }

      this.logger.log(
        `Upgrading "${registration.name}" (${registration.id}) to version ${registration.latestAvailableVersion} on all workspaces that have it installed...`,
      );

      await this.applicationUpgradeService.upgradeAllApplications({
        applicationRegistrationId: registration.id,
        onlyAutoUpgrade: false,
        batchSize: options.batchSize,
      });
    }

    this.logger.log(chalk.blue('Command completed!'));
  }
}

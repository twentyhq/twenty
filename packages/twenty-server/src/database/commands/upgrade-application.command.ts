import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';

type UpgradeApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  batchSize?: number;
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

    if (!isDefined(registration.latestAvailableVersion)) {
      this.logger.warn(
        `Application "${registration.name}" (${registration.universalIdentifier}) has no latest available version, nothing to upgrade`,
      );

      return;
    }

    this.logger.log(
      `Upgrading "${registration.name}" (${registration.universalIdentifier}) to version ${registration.latestAvailableVersion} on all workspaces that have it installed...`,
    );

    await this.applicationUpgradeService.upgradeAllApplications({
      applicationRegistrationId: registration.id,
      onlyAutoUpgrade: false,
      batchSize: options.batchSize,
    });

    this.logger.log(chalk.blue('Command completed!'));
  }
}

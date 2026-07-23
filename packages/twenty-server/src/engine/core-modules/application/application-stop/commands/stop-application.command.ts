import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';

type StopApplicationCommandOptions = {
  applicationUniversalIdentifier: string;
};

@Command({
  name: 'stop-application',
  description:
    'Globally stop an application by enabling its kill switch: its logic functions stop executing on every workspace until the switch is cleared',
})
export class StopApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationStopService: ApplicationStopService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags:
      '-u, --application-universal-identifier <application_universal_identifier>',
    description: 'Application universal identifier',
    required: true,
  })
  parseApplicationUniversalIdentifier(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: StopApplicationCommandOptions,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: {
        universalIdentifier: options.applicationUniversalIdentifier,
      },
    });

    if (!isDefined(registration)) {
      throw new Error(
        `Application registration with universal identifier ${options.applicationUniversalIdentifier} not found`,
      );
    }

    await this.applicationStopService.stop(
      options.applicationUniversalIdentifier,
    );

    this.logger.log(
      `Kill switch enabled for "${registration.name}" (${options.applicationUniversalIdentifier}). Workers pick it up within a minute.`,
    );

    this.logger.log(chalk.blue('Command completed!'));
  }
}

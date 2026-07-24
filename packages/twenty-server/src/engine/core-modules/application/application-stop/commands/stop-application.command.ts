import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

type StopApplicationCommandOptions = {
  applicationUniversalIdentifier: string;
  workspaceId?: string;
  yes?: boolean;
};

@Command({
  name: 'stop-application',
  description:
    'Stop an application by enabling its kill switch: its logic functions stop executing until the switch is cleared. Applies to every workspace, or to a single one with --workspace-id',
})
export class StopApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description:
      'Only stop the application on the given workspace id. Stops it on every workspace if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
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

    if (!(options.yes ?? false)) {
      const isConfirmed = await this.askForConfirmation(
        options.applicationUniversalIdentifier,
        registration.id,
        options.workspaceId,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, no kill switch enabled');

        return;
      }
    }

    await this.applicationStopService.stop(
      options.applicationUniversalIdentifier,
      options.workspaceId,
    );

    this.logger.log(
      `Kill switch enabled for "${registration.name}" (${options.applicationUniversalIdentifier})${
        isDefined(options.workspaceId)
          ? ` on workspace ${options.workspaceId}`
          : ''
      }. Workers pick it up within a minute.`,
    );

    this.logger.log(chalk.blue('Command completed!'));
  }

  private async askForConfirmation(
    applicationUniversalIdentifier: string,
    applicationRegistrationId: string,
    workspaceId?: string,
  ): Promise<boolean> {
    const target = isDefined(workspaceId)
      ? `workspace ${workspaceId}`
      : `${await this.applicationRepository.count({
          where: { applicationRegistrationId },
        })} workspace(s)`;

    return askCommandConfirmation(
      `Confirm stopping application ${applicationUniversalIdentifier} on ${target}`,
    );
  }
}

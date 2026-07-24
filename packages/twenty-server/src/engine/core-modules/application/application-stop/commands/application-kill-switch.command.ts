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

const KILL_SWITCH_ACTIONS = ['stop', 'start'] as const;

type KillSwitchAction = (typeof KILL_SWITCH_ACTIONS)[number];

type ApplicationKillSwitchCommandOptions = {
  applicationUniversalIdentifier: string;
  workspaceId?: string;
  yes?: boolean;
};

@Command({
  name: 'application:kill-switch',
  arguments: '[action]',
  description:
    'Toggle an application kill switch: "stop" (default) halts its logic function executions until "start" clears the switch. Applies to every workspace, or to a single one with --workspace-id',
})
export class ApplicationKillSwitchCommand extends CommandRunner {
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
      'Only toggle the kill switch on the given workspace id. Applies to every workspace if not provided.',
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
    passedParams: string[],
    options: ApplicationKillSwitchCommandOptions,
  ): Promise<void> {
    const action = (passedParams[0] ?? 'stop') as KillSwitchAction;

    if (!KILL_SWITCH_ACTIONS.includes(action)) {
      throw new Error(
        `Invalid action "${passedParams[0]}". Expected one of: ${KILL_SWITCH_ACTIONS.join(', ')}`,
      );
    }

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
        action,
        options.applicationUniversalIdentifier,
        registration.id,
        options.workspaceId,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, kill switch left unchanged');

        return;
      }
    }

    if (action === 'stop') {
      await this.applicationStopService.stop(
        options.applicationUniversalIdentifier,
        options.workspaceId,
      );
    } else {
      await this.applicationStopService.start(
        options.applicationUniversalIdentifier,
        options.workspaceId,
      );
    }

    this.logger.log(
      `Kill switch ${action === 'stop' ? 'enabled' : 'removed'} for "${registration.name}" (${options.applicationUniversalIdentifier})${
        isDefined(options.workspaceId)
          ? ` on workspace ${options.workspaceId}`
          : ''
      }. Workers pick it up within a minute.`,
    );

    this.logger.log(chalk.blue('Command completed!'));
  }

  private async askForConfirmation(
    action: KillSwitchAction,
    applicationUniversalIdentifier: string,
    applicationRegistrationId: string,
    workspaceId?: string,
  ): Promise<boolean> {
    const target = isDefined(workspaceId)
      ? `workspace ${workspaceId}`
      : `${await this.applicationRepository.count({
          where: { applicationRegistrationId },
        })} workspace(s)`;

    const actionLabel =
      action === 'stop' ? 'stopping' : 'removing the kill switch of';

    return askCommandConfirmation(
      `Confirm ${actionLabel} application ${applicationUniversalIdentifier} on ${target}`,
    );
  }
}

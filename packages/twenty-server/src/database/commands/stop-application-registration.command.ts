import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

@Command({
  name: 'application-registration:stop',
  description:
    'Server-level kill switch: block all logic function executions of every application installed from a registration, across all workspaces. Reverse with application-registration:start.',
})
export class StopApplicationRegistrationCommand extends CommandRunner {
  private readonly logger = new Logger(StopApplicationRegistrationCommand.name);

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
  }

  @Option({
    flags: '-r, --application-registration-id <application_registration_id>',
    description:
      'id of the application registration (core.applicationRegistration) to stop',
    required: true,
  })
  parseApplicationRegistrationId(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: { applicationRegistrationId: string },
  ): Promise<void> {
    const { applicationRegistration, installedApplicationCount } =
      await this.applicationStopService.stopApplicationRegistration({
        applicationRegistrationId: options.applicationRegistrationId,
      });

    this.logger.log(
      `Stopped application registration "${applicationRegistration.name}" (${applicationRegistration.id}). All logic function executions of its ${installedApplicationCount} installed application(s) are now blocked, across all workspaces.`,
    );
  }
}

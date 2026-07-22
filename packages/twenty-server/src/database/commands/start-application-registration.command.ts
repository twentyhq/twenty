import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

@Command({
  name: 'application-registration:start',
  description:
    'Lift the server-level kill switch set by application-registration:stop and resume logic function executions of all applications installed from the registration.',
})
export class StartApplicationRegistrationCommand extends CommandRunner {
  private readonly logger = new Logger(
    StartApplicationRegistrationCommand.name,
  );

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
  }

  @Option({
    flags: '-r, --application-registration-id <application_registration_id>',
    description:
      'id of the application registration (core.applicationRegistration) to start',
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
      await this.applicationStopService.startApplicationRegistration({
        applicationRegistrationId: options.applicationRegistrationId,
      });

    this.logger.log(
      `Started application registration "${applicationRegistration.name}" (id ${applicationRegistration.id}, universalIdentifier ${applicationRegistration.universalIdentifier}): the server-level stop is lifted for its ${installedApplicationCount} installed application(s). Workspace-level stops set with application:stop remain in effect.`,
    );
  }
}

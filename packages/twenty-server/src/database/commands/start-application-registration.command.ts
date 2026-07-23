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
    flags:
      '-r, --application-registration-universal-identifier <universal_identifier>',
    description:
      'universal identifier of the application registration to start',
    required: true,
  })
  parseApplicationRegistrationUniversalIdentifier(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: { applicationRegistrationUniversalIdentifier: string },
  ): Promise<void> {
    const { applicationRegistration, installedApplicationCount } =
      await this.applicationStopService.startApplicationRegistration({
        applicationRegistrationUniversalIdentifier:
          options.applicationRegistrationUniversalIdentifier,
      });

    this.logger.log(
      `Started application registration "${applicationRegistration.name}" (universalIdentifier ${applicationRegistration.universalIdentifier}): the server-level stop is lifted for its ${installedApplicationCount} installed application(s). Workspace-level stops set with application:stop remain in effect.`,
    );
  }
}

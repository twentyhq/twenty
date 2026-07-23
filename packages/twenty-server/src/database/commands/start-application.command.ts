import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

type StartApplicationCommandOptions = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

@Command({
  name: 'application:start',
  description:
    'Lift the workspace-level kill switch set by application:stop and resume logic function executions of the application.',
})
export class StartApplicationCommand extends CommandRunner {
  private readonly logger = new Logger(StartApplicationCommand.name);

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'id of the workspace the application is installed in',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-a, --application-universal-identifier <universal_identifier>',
    description: 'universal identifier of the application to start',
    required: true,
  })
  parseApplicationUniversalIdentifier(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: StartApplicationCommandOptions,
  ): Promise<void> {
    const application = await this.applicationStopService.startApplication({
      workspaceId: options.workspaceId,
      applicationUniversalIdentifier: options.applicationUniversalIdentifier,
    });

    this.logger.log(
      `Started application "${application.name}" (universalIdentifier ${application.universalIdentifier}) in workspace ${application.workspaceId}: the workspace-level stop is lifted.`,
    );

    if (
      isDefined(application.applicationRegistrationId) &&
      (await this.applicationStopService.isApplicationRegistrationStopped(
        application.applicationRegistrationId,
      ))
    ) {
      this.logger.warn(
        `Application registration ${application.applicationRegistrationId} is still stopped server-wide: executions of this application remain blocked until application-registration:start is run.`,
      );
    }
  }
}

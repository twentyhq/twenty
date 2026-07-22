import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

@Command({
  name: 'application:stop',
  description:
    'Workspace-level kill switch: block all logic function executions of one installed application. Reverse with application:start.',
})
export class StopApplicationCommand extends CommandRunner {
  private readonly logger = new Logger(StopApplicationCommand.name);

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
  }

  @Option({
    flags: '-a, --application-id <application_id>',
    description: 'id of the installed application (core.application) to stop',
    required: true,
  })
  parseApplicationId(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: { applicationId: string },
  ): Promise<void> {
    const application = await this.applicationStopService.stopApplication({
      applicationId: options.applicationId,
    });

    this.logger.log(
      `Stopped application "${application.name}" (id ${application.id}, universalIdentifier ${application.universalIdentifier}) in workspace ${application.workspaceId}. All its logic function executions are now blocked.`,
    );
  }
}

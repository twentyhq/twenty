import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

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
    flags: '-a, --application-id <application_id>',
    description: 'id of the installed application (core.application) to start',
    required: true,
  })
  parseApplicationId(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: { applicationId: string },
  ): Promise<void> {
    const application = await this.applicationStopService.startApplication({
      applicationId: options.applicationId,
    });

    this.logger.log(
      `Started application "${application.name}" (${application.id}) in workspace ${application.workspaceId}. Logic function executions are allowed again.`,
    );
  }
}

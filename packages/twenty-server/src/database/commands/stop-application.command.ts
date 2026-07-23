import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

type StopApplicationCommandOptions = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

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
    flags: '-w, --workspace-id <workspace_id>',
    description: 'id of the workspace the application is installed in',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-a, --application-universal-identifier <universal_identifier>',
    description: 'universal identifier of the application to stop',
    required: true,
  })
  parseApplicationUniversalIdentifier(value: string): string {
    return value;
  }

  override async run(
    _passedParams: string[],
    options: StopApplicationCommandOptions,
  ): Promise<void> {
    const application = await this.applicationStopService.stopApplication({
      workspaceId: options.workspaceId,
      applicationUniversalIdentifier: options.applicationUniversalIdentifier,
    });

    this.logger.log(
      `Stopped application "${application.name}" (universalIdentifier ${application.universalIdentifier}) in workspace ${application.workspaceId}. All its logic function executions are now blocked.`,
    );
  }
}

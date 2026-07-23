import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

type StartApplicationCommandOptions = {
  applicationUniversalIdentifier: string;
};

@Command({
  name: 'application:start',
  description:
    'Lift the temporary kill switch set by application:stop and resume logic function executions across all workspaces.',
})
export class StartApplicationCommand extends CommandRunner {
  private readonly logger = new Logger(StartApplicationCommand.name);

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
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
    await this.applicationStopService.startApplication({
      applicationUniversalIdentifier: options.applicationUniversalIdentifier,
    });

    this.logger.log(
      `Started application ${options.applicationUniversalIdentifier} across all workspaces.`,
    );
  }
}

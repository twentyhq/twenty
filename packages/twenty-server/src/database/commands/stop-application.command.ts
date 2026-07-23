import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';

type StopApplicationCommandOptions = {
  applicationUniversalIdentifier: string;
};

@Command({
  name: 'application:stop',
  description:
    'Temporarily block all logic function executions of an application across all workspaces. Reverse with application:start.',
})
export class StopApplicationCommand extends CommandRunner {
  private readonly logger = new Logger(StopApplicationCommand.name);

  constructor(private readonly applicationStopService: ApplicationStopService) {
    super();
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
    await this.applicationStopService.stopApplication({
      applicationUniversalIdentifier: options.applicationUniversalIdentifier,
    });

    this.logger.log(
      `Stopped application ${options.applicationUniversalIdentifier} across all workspaces for up to 24 hours.`,
    );
  }
}

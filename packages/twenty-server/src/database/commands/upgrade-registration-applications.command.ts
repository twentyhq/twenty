import { Command, CommandRunner, Option } from 'nest-commander';

import { CommandLogger } from 'src/database/commands/logger';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';

type UpgradeRegistrationApplicationsCommandOptions = {
  applicationRegistrationId: string;
};

@Command({
  name: 'upgrade-registration-applications',
  description:
    'Upgrade all installed applications of an application registration to its latest available version',
})
export class UpgradeRegistrationApplicationsCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags: '-r, --application-registration-id <application_registration_id>',
    description: 'application registration id',
    required: true,
  })
  parseApplicationRegistrationId(val: string): string {
    return val;
  }

  override async run(
    _passedParams: string[],
    options: UpgradeRegistrationApplicationsCommandOptions,
  ): Promise<void> {
    await this.applicationUpgradeService.upgradeAllApplications({
      applicationRegistrationId: options.applicationRegistrationId,
    });

    this.logger.log('Command completed!');
  }
}

import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { CrmObjectsSeederService } from 'src/modules/crm-acceleration/services/crm-objects-seeder.service';

@Command({
  name: 'crm:seed-objects',
  description:
    'Seed custom CRM objects (Pipeline, Product, Project, Quote, etc.) into a workspace',
})
export class SeedCrmObjectsCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCrmObjectsCommand.name);

  constructor(
    private readonly crmObjectsSeederService: CrmObjectsSeederService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspaceId>',
    description: 'Workspace ID to seed CRM objects into (required)',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParams: string[],
    options: { workspaceId: string },
  ): Promise<void> {
    const { workspaceId } = options;

    this.logger.log(
      `Seeding CRM objects for workspace ${workspaceId}...`,
    );

    try {
      await this.crmObjectsSeederService.seedCrmObjects(workspaceId);
      this.logger.log('CRM objects seeded successfully.');
    } catch (error) {
      this.logger.error(`Failed to seed CRM objects: ${error}`);
      throw error;
    }
  }
}

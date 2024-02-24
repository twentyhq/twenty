import { Command, CommandRunner } from 'nest-commander';

import { DataSeedDemoWorkspaceService } from 'src/database/commands/data-seed-demo-workspace/services/data-seed-demo-workspace.service';

@Command({
  name: 'workspace:seed:demo',
  description: 'Seed workspace with demo data. Use in development only.',
})
export class DataSeedDemoWorkspaceCommand extends CommandRunner {
  constructor(
    private readonly dataSeedDemoWorkspaceService: DataSeedDemoWorkspaceService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.dataSeedDemoWorkspaceService.seedDemo();
  }
}

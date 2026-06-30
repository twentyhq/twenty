import { type DataSource } from 'typeorm';

import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

export interface SlowInstanceCommand extends FastInstanceCommand {
  runDataMigration(dataSource: DataSource): Promise<void>;
}

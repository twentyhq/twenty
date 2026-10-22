import { type QueryRunner } from 'typeorm';

import { AddApplicationRegistrationVersionsFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-instance-command-fast-1792077317736-add-application-registration-versions';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792655604265)
export class RepairApplicationRegistrationVersionsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ tableExists }] = await queryRunner.query(
      `SELECT to_regclass('core."applicationRegistrationVersion"') IS NOT NULL AS "tableExists"`,
    );

    if (tableExists) {
      return;
    }

    await new AddApplicationRegistrationVersionsFastInstanceCommand().up(
      queryRunner,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}

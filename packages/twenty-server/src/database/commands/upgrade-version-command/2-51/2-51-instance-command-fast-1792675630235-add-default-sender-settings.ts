import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792675630235)
export class AddDefaultSenderSettingsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD COLUMN IF NOT EXISTS "defaultSenderDomain" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" ADD COLUMN IF NOT EXISTS "defaultFromHandle" character varying',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" DROP COLUMN IF EXISTS "defaultFromHandle"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN IF EXISTS "defaultSenderDomain"',
    );
  }
}

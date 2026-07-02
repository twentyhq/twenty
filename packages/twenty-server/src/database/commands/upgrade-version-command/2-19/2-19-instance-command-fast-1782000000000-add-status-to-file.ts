import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1782000000000)
export class AddStatusToFileFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "status" character varying NOT NULL DEFAULT 'UPLOADED'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILE_STATUS" ON "core"."file" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_FILE_STATUS"`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "status"`,
    );
  }
}

import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783082964705)
export class AddStatusToFileFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."file_status_enum" AS ENUM('PENDING', 'UPLOADED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD COLUMN IF NOT EXISTS "status" "core"."file_status_enum" NOT NULL DEFAULT 'UPLOADED'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_FILE_STATUS" ON "core"."file" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "core"."IDX_FILE_STATUS"`);
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "core"."file_status_enum"`);
  }
}

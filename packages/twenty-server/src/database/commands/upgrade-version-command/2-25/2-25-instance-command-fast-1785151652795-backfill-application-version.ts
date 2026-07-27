import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785151652795)
export class BackfillApplicationVersionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "core"."application"
      SET "version" = '0.0.0'
      WHERE "version" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "version" SET DEFAULT '0.0.0'`
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "version" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "version" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "version" DROP NOT NULL`
    );
  }
}

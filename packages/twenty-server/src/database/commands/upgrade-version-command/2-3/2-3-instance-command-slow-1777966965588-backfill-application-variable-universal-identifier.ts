import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777966965588, { type: 'slow' })
export class BackfillApplicationVariableUniversalIdentifierSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      'UPDATE "core"."applicationVariable" SET "universalIdentifier" = gen_random_uuid() WHERE "universalIdentifier" IS NULL',
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "universalIdentifier" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_44ecebdf70cbed17f89527b36b" ON "core"."applicationVariable" ("workspaceId", "universalIdentifier") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_44ecebdf70cbed17f89527b36b"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ALTER COLUMN "universalIdentifier" DROP NOT NULL',
    );
  }
}

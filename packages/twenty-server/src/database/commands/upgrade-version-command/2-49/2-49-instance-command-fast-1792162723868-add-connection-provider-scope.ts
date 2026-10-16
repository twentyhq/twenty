import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.49.0', 1792162723868)
export class AddConnectionProviderScopeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "core"."connectionProvider_scope_enum" AS ENUM(\'WORKSPACE\', \'USER\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" ADD "scope" "core"."connectionProvider_scope_enum" NOT NULL DEFAULT \'WORKSPACE\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" DROP COLUMN "scope"',
    );
    await queryRunner.query('DROP TYPE "core"."connectionProvider_scope_enum"');
  }
}

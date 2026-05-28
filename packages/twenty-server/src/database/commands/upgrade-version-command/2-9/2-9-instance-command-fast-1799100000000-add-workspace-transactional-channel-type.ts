import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.9.0', 1799100000000)
export class AddWorkspaceTransactionalChannelTypeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."messageChannel_type_enum" RENAME TO "messageChannel_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"messageChannel_type_enum\" AS ENUM('EMAIL', 'SMS', 'EMAIL_GROUP', 'WORKSPACE_TRANSACTIONAL')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum" USING "type"::"text"::"core"."messageChannel_type_enum"',
    );
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete rows whose enum value won't exist after we narrow the type back
    // down — otherwise the USING cast below fails on 'WORKSPACE_TRANSACTIONAL'.
    await queryRunner.query(
      `DELETE FROM "core"."messageChannel" WHERE "type" = 'WORKSPACE_TRANSACTIONAL'`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."connectedAccount" WHERE "provider" = 'workspace_transactional'`,
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"messageChannel_type_enum_old\" AS ENUM('EMAIL', 'SMS', 'EMAIL_GROUP')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum_old" USING "type"::"text"::"core"."messageChannel_type_enum_old"',
    );
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."messageChannel_type_enum_old" RENAME TO "messageChannel_type_enum"',
    );
  }
}

import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1778256809018)
export class AddEmailGroupChannelTypeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."messageChannel_type_enum" RENAME TO "messageChannel_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"messageChannel_type_enum\" AS ENUM('EMAIL', 'SMS', 'EMAIL_GROUP')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum" USING "type"::"text"::"core"."messageChannel_type_enum"',
    );
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "core"."messageChannel_type_enum_old" AS ENUM(\'EMAIL\', \'SMS\')',
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

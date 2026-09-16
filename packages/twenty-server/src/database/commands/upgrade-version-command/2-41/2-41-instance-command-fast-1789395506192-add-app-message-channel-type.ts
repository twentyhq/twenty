import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789395506192)
export class AddAppMessageChannelTypeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum" RENAME TO "messageChannel_type_enum_old"');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum" AS ENUM(\'EMAIL\', \'SMS\', \'EMAIL_GROUP\', \'APP\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum" USING "type"::"text"::"core"."messageChannel_type_enum"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Narrowing the enum casts every existing row into it, so an APP channel
    // left behind makes the rollback itself fail. Rolling back removes the
    // code that can read these channels, so the rows are already dead.
    await queryRunner.query('DELETE FROM "core"."messageChannel" WHERE "type" = \'APP\'');
    await queryRunner.query('CREATE TYPE "core"."messageChannel_type_enum_old" AS ENUM(\'EMAIL\', \'SMS\', \'EMAIL_GROUP\')');
    await queryRunner.query('ALTER TABLE "core"."messageChannel" ALTER COLUMN "type" TYPE "core"."messageChannel_type_enum_old" USING "type"::"text"::"core"."messageChannel_type_enum_old"');
    await queryRunner.query('DROP TYPE "core"."messageChannel_type_enum"');
    await queryRunner.query('ALTER TYPE "core"."messageChannel_type_enum_old" RENAME TO "messageChannel_type_enum"');
  }
}

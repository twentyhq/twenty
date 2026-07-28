import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785256000000)
export class AddDefaultOpenRecordInToObjectMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."objectMetadata_defaultopenrecordin_enum" AS ENUM('SIDE_PANEL', 'RECORD_PAGE', 'USER_PREFERENCE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "defaultOpenRecordIn" "core"."objectMetadata_defaultopenrecordin_enum" NOT NULL DEFAULT 'USER_PREFERENCE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN "defaultOpenRecordIn"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."objectMetadata_defaultopenrecordin_enum"',
    );
  }
}

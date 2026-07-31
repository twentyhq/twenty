import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.27.0', 1785477000000)
export class AddOpenRecordInToObjectMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."objectMetadata_openrecordin_enum" AS ENUM('SIDE_PANEL', 'RECORD_PAGE', 'USER_CHOICE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "openRecordIn" "core"."objectMetadata_openrecordin_enum" NOT NULL DEFAULT 'USER_CHOICE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN "openRecordIn"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."objectMetadata_openrecordin_enum"',
    );
  }
}

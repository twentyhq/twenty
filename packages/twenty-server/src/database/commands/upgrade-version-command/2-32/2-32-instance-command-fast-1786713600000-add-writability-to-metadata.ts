import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.32.0', 1786713600000)
export class AddWritabilityToMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."objectMetadata_writability_enum" AS ENUM('OPEN', 'APPLICATION', 'SYSTEM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "writability" "core"."objectMetadata_writability_enum" NOT NULL DEFAULT 'OPEN'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."fieldMetadata_writability_enum" AS ENUM('OPEN', 'APPLICATION', 'SYSTEM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "writability" "core"."fieldMetadata_writability_enum" NOT NULL DEFAULT 'OPEN'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN "writability"',
    );
    await queryRunner.query('DROP TYPE "core"."fieldMetadata_writability_enum"');
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN "writability"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."objectMetadata_writability_enum"',
    );
  }
}

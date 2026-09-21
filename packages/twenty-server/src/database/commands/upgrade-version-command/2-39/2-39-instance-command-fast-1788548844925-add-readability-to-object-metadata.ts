import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.39.0', 1788548844925)
export class AddReadabilityToObjectMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."objectMetadata_readability_enum" AS ENUM('OPEN', 'PRIVATE', 'INHERITED', 'APPLICATION', 'SYSTEM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "readability" "core"."objectMetadata_readability_enum" NOT NULL DEFAULT 'OPEN'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN "readability"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."objectMetadata_readability_enum"',
    );
  }
}

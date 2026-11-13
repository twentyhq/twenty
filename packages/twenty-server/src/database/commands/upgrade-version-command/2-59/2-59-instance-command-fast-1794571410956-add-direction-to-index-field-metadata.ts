import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794571410956)
export class AddDirectionToIndexFieldMetadataFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"core\".\"indexFieldMetadata_direction_enum\" AS ENUM('AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."indexFieldMetadata" ADD "direction" "core"."indexFieldMetadata_direction_enum"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."indexFieldMetadata" DROP COLUMN "direction"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."indexFieldMetadata_direction_enum"',
    );
  }
}

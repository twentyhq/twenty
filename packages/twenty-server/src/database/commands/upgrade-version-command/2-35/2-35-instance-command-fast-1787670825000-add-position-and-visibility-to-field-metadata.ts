import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.35.0', 1787670825000)
export class AddPositionAndVisibilityToFieldMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "position" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "isVisibleByDefault" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN "isVisibleByDefault"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN "position"',
    );
  }
}

import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1793898855453)
export class MakeFieldMetadataOptionValueUniqueDeferredFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // USING INDEX promotes the existing unique index without rebuilding it.
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE" UNIQUE USING INDEX "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE" DEFERRABLE INITIALLY DEFERRED');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" DROP CONSTRAINT "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE"');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE" ON "core"."fieldMetadataOption" ("fieldMetadataId", "value") ');
  }
}

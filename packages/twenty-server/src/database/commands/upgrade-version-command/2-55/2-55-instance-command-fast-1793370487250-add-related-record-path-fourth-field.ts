import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.55.0', 1793370487250)
export class AddRelatedRecordPathFourthFieldFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD "fourthFieldMetadataId" uuid');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS"');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS" ON "core"."relatedRecordPath" ("firstFieldMetadataId", "secondFieldMetadataId", "thirdFieldMetadataId") WHERE "thirdFieldMetadataId" IS NOT NULL AND "fourthFieldMetadataId" IS NULL');
    await queryRunner.query('CREATE INDEX "IDX_RELATED_RECORD_PATH_FOURTH_FIELD_METADATA_ID" ON "core"."relatedRecordPath" ("fourthFieldMetadataId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_FOUR_HOPS" ON "core"."relatedRecordPath" ("firstFieldMetadataId", "secondFieldMetadataId", "thirdFieldMetadataId", "fourthFieldMetadataId") WHERE "fourthFieldMetadataId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_a6b91d47ea3189baa2f234c7d75" FOREIGN KEY ("fourthFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_a6b91d47ea3189baa2f234c7d75"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_FOUR_HOPS"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_FOURTH_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS"');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP COLUMN "fourthFieldMetadataId"');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS" ON "core"."relatedRecordPath" ("firstFieldMetadataId", "secondFieldMetadataId", "thirdFieldMetadataId") WHERE "thirdFieldMetadataId" IS NOT NULL');
  }
}

import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793290228589)
export class AddRelatedRecordPathTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."relatedRecordPath" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstFieldMetadataId" uuid NOT NULL, "secondFieldMetadataId" uuid, "thirdFieldMetadataId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5105d98eee85b6a1e674109ba3d" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_054f9c52cf0e890640683d0a4a" ON "core"."relatedRecordPath" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_RELATED_RECORD_PATH_THIRD_FIELD_METADATA_ID" ON "core"."relatedRecordPath" ("thirdFieldMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_RELATED_RECORD_PATH_SECOND_FIELD_METADATA_ID" ON "core"."relatedRecordPath" ("secondFieldMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_RELATED_RECORD_PATH_FIRST_FIELD_METADATA_ID" ON "core"."relatedRecordPath" ("firstFieldMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_RELATED_RECORD_PATH_APPLICATION_ID" ON "core"."relatedRecordPath" ("applicationId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS" ON "core"."relatedRecordPath" ("firstFieldMetadataId", "secondFieldMetadataId", "thirdFieldMetadataId") WHERE "thirdFieldMetadataId" IS NOT NULL');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_TWO_HOPS" ON "core"."relatedRecordPath" ("firstFieldMetadataId", "secondFieldMetadataId") WHERE "secondFieldMetadataId" IS NOT NULL AND "thirdFieldMetadataId" IS NULL');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_RELATED_RECORD_PATH_UNIQUE_ONE_HOP" ON "core"."relatedRecordPath" ("firstFieldMetadataId") WHERE "secondFieldMetadataId" IS NULL');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_623b51b39f35e8166ab756cf516" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_9caff61edf6734e6ec7e08d7863" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_49d185010a658fe0c23d90ee658" FOREIGN KEY ("firstFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_c15bed1409e7a69ac2dfbbd6ea4" FOREIGN KEY ("secondFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" ADD CONSTRAINT "FK_5edcdacfe9a320166f833bd951d" FOREIGN KEY ("thirdFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_5edcdacfe9a320166f833bd951d"');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_c15bed1409e7a69ac2dfbbd6ea4"');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_49d185010a658fe0c23d90ee658"');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_9caff61edf6734e6ec7e08d7863"');
    await queryRunner.query('ALTER TABLE "core"."relatedRecordPath" DROP CONSTRAINT "FK_623b51b39f35e8166ab756cf516"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_ONE_HOP"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_TWO_HOPS"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_UNIQUE_THREE_HOPS"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_FIRST_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_SECOND_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RELATED_RECORD_PATH_THIRD_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_054f9c52cf0e890640683d0a4a"');
    await queryRunner.query('DROP TABLE "core"."relatedRecordPath"');
  }
}

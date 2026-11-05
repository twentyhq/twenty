import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793814954654)
export class AddFieldMetadataOptionTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."fieldMetadataOption" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "overrides" jsonb, "isActive" boolean NOT NULL DEFAULT true, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "value" character varying NOT NULL, "label" character varying NOT NULL, "color" character varying, "position" double precision NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c9060d4696fdbd5f86ecebd7fb1" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_8943119a119b01408f422b8212" ON "core"."fieldMetadataOption" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE" ON "core"."fieldMetadataOption" ("fieldMetadataId", "value") ');
    await queryRunner.query('CREATE INDEX "IDX_FIELD_METADATA_OPTION_APPLICATION_ID" ON "core"."fieldMetadataOption" ("applicationId") ');
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_27b4d06b908e0663b675de3e974" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_db1306d4c94604c52d5db100668" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" ADD CONSTRAINT "FK_12966faa34751ce8979af6e5a1a" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" DROP CONSTRAINT "FK_12966faa34751ce8979af6e5a1a"');
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" DROP CONSTRAINT "FK_db1306d4c94604c52d5db100668"');
    await queryRunner.query('ALTER TABLE "core"."fieldMetadataOption" DROP CONSTRAINT "FK_27b4d06b908e0663b675de3e974"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_METADATA_OPTION_APPLICATION_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_METADATA_OPTION_FIELD_METADATA_ID_VALUE_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_8943119a119b01408f422b8212"');
    await queryRunner.query('DROP TABLE "core"."fieldMetadataOption"');
  }
}

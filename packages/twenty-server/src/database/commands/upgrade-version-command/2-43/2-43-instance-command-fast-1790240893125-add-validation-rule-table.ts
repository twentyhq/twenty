import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790240893125)
export class AddValidationRuleTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."validationRule" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectMetadataId" uuid NOT NULL, "errorFieldMetadataId" uuid, "expression" text NOT NULL, "bindings" jsonb NOT NULL DEFAULT \'{}\', "message" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "evaluatorVersion" integer NOT NULL DEFAULT \'1\', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_293a30050cd51815f8ed80780e4" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_e92c299771228b9f31a092e64c" ON "core"."validationRule" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_VALIDATION_RULE_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."validationRule" ("workspaceId", "objectMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_VALIDATION_RULE_ERROR_FIELD_METADATA_ID" ON "core"."validationRule" ("errorFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."validationRule" ADD CONSTRAINT "FK_f664e9abe4db4c6104554529d94" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."validationRule" ADD CONSTRAINT "FK_6eed71e19346f9e09f1fa94ed76" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."validationRule" ADD CONSTRAINT "FK_6b3d85b4b9f0529f24e43649d4c" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."validationRule" ADD CONSTRAINT "FK_e640b1e4b64ac470c2fa0f29830" FOREIGN KEY ("errorFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."validationRule" DROP CONSTRAINT "FK_e640b1e4b64ac470c2fa0f29830"');
    await queryRunner.query('ALTER TABLE "core"."validationRule" DROP CONSTRAINT "FK_6b3d85b4b9f0529f24e43649d4c"');
    await queryRunner.query('ALTER TABLE "core"."validationRule" DROP CONSTRAINT "FK_6eed71e19346f9e09f1fa94ed76"');
    await queryRunner.query('ALTER TABLE "core"."validationRule" DROP CONSTRAINT "FK_f664e9abe4db4c6104554529d94"');
    await queryRunner.query('DROP INDEX "core"."IDX_VALIDATION_RULE_ERROR_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_VALIDATION_RULE_WORKSPACE_ID_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_e92c299771228b9f31a092e64c"');
    await queryRunner.query('DROP TABLE "core"."validationRule"');
  }
}

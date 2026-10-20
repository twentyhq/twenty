import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.50.0', 1792496432075)
export class AddRecordInheritanceRuleTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."recordInheritanceRule" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectMetadataId" uuid NOT NULL, "parentObjectMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "junctionFieldMetadataId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_RECORD_INHERITANCE_RULE_ID" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_148703b7362816a1690b7f1e3f" ON "core"."recordInheritanceRule" ("workspaceId", "universalIdentifier")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_RECORD_INHERITANCE_RULE_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."recordInheritanceRule" ("workspaceId", "objectMetadataId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_76c8e4633bd9fd3e2c7ee66105d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_3eba29c02db932549b7382e7e86" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_4167a0f64361b85efc097b636a1" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_77540c3550360d77336980c11fa" FOREIGN KEY ("parentObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_2638ae26a44303752e84eb2237d" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."recordInheritanceRule" ADD CONSTRAINT "FK_afc4282b202328e91d1a2fbb02d" FOREIGN KEY ("junctionFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "core"."recordInheritanceRule"');
  }
}

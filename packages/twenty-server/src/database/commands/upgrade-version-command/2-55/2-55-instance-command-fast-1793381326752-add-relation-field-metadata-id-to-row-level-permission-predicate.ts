import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.55.0', 1793381326752)
export class AddRelationFieldMetadataIdToRowLevelPermissionPredicateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "relationFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_RELATION_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("relationFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_18554ded14c33fc6f075922ef95" FOREIGN KEY ("relationFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_18554ded14c33fc6f075922ef95"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_RELATION_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "relationFieldMetadataId"');
  }
}

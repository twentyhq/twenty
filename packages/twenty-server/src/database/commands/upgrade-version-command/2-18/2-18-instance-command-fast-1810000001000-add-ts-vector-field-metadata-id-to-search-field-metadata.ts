import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.18.0', 1810000001000)
export class AddTsVectorFieldMetadataIdToSearchFieldMetadataFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD "tsVectorFieldMetadataId" uuid');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_31102b31f7338b6a298fc22996a" FOREIGN KEY ("tsVectorFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_31102b31f7338b6a298fc22996a"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "tsVectorFieldMetadataId"');
  }
}

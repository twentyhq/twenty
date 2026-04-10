import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.22.0', 1775804361516)
export class DropObjectMetadataDataSourceFkFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_0b19dd17369574578bc18c405b2"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_OBJECT_METADATA_DATA_SOURCE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ALTER COLUMN "dataSourceId" DROP NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ALTER COLUMN "dataSourceId" SET NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_OBJECT_METADATA_DATA_SOURCE_ID" ON "core"."objectMetadata" ("dataSourceId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_0b19dd17369574578bc18c405b2" FOREIGN KEY ("dataSourceId") REFERENCES "core"."dataSource"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }
}

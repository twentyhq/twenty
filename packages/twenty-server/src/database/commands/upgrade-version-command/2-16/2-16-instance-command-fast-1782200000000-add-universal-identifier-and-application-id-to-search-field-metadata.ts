import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1782200000000)
export class AddUniversalIdentifierAndApplicationIdToSearchFieldMetadataFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD "universalIdentifier" uuid NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD "applicationId" uuid NOT NULL');
    // The column is NOT NULL but added without a default: searchFieldMetadata is dormant/empty
    // at instance-command time and the 2-16 backfill workspace command populates positions.
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD "position" double precision NOT NULL');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_c2e441c901b45221a70d325349" ON "core"."searchFieldMetadata" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_927b6101a5d9562a558a18ed412" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_927b6101a5d9562a558a18ed412"');
    await queryRunner.query('DROP INDEX "core"."IDX_c2e441c901b45221a70d325349"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "position"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "applicationId"');
    await queryRunner.query('ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN "universalIdentifier"');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShouldSyncLabelAndName1728579416430
  implements MigrationInterface
{
  name = 'AddShouldSyncLabelAndName1728579416430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "shouldSyncLabelAndName" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "shouldSyncLabelAndName"`,
    );
  }
}

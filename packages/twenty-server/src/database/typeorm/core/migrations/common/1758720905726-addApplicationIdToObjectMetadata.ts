import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationIdToObjectMetadata1758720905726
  implements MigrationInterface
{
  name = 'AddApplicationIdToObjectMetadata1758720905726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "applicationId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "applicationId"`,
    );
  }
}

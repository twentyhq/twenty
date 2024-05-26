import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingsColumnToFieldMetadata1713793656356
  implements MigrationInterface
{
  name = 'AddSettingsColumnToFieldMetadata1713793656356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "settings" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" DROP COLUMN "foreignDataWrapperType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" ADD "foreignDataWrapperType" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" DROP COLUMN "foreignDataWrapperType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."remoteServer" ADD "foreignDataWrapperType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "settings"`,
    );
  }
}

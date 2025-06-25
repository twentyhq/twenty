import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnsiginalAppWorkspaceFields1750863580868
  implements MigrationInterface
{
  name = 'AddOnsiginalAppWorkspaceFields1750863580868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "onesignalAppId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "onesignalApiKey" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "onesignalApiKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "onesignalAppId"`,
    );
  }
}

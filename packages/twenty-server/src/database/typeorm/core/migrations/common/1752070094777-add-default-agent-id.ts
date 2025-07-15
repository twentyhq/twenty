import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultAgentId1752070094777 implements MigrationInterface {
  name = 'AddDefaultAgentId1752070094777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "defaultAgentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'auto'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "defaultAgentId"`,
    );
  }
}

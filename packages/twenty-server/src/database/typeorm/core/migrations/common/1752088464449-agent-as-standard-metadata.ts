import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgentAsStandardMetadata1752088464449
  implements MigrationInterface
{
  name = 'AgentAsStandardMetadata1752088464449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD "label" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD "icon" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD "isCustom" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE" UNIQUE ("name", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "isCustom"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."agent" DROP COLUMN "icon"`);
    await queryRunner.query(`ALTER TABLE "core"."agent" DROP COLUMN "label"`);
  }
}

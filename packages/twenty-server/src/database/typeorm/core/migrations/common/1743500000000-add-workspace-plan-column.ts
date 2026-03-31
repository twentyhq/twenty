import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspacePlanColumn1743500000000 implements MigrationInterface {
  name = 'AddWorkspacePlanColumn1743500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "workspace_plan_enum" AS ENUM ('FREE', 'PRO', 'ENTERPRISE')
    `);

    await queryRunner.query(`
      ALTER TABLE "core"."workspace" 
      ADD COLUMN "plan" "workspace_plan_enum" NOT NULL DEFAULT 'FREE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."workspace" 
      DROP COLUMN "plan"
    `);

    await queryRunner.query(`
      DROP TYPE "workspace_plan_enum"
    `);
  }
}

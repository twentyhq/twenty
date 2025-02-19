import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubdomainToWorkspace1730137590546
  implements MigrationInterface
{
  name = 'AddSubdomainToWorkspace1730137590546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "subdomain" varchar NULL`,
    );
    await queryRunner.query(`UPDATE "core"."workspace" SET "subdomain" = "id"`);
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subdomain" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX workspace_subdomain_unique_index ON "core"."workspace" (subdomain)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "subdomain"`,
    );
  }
}

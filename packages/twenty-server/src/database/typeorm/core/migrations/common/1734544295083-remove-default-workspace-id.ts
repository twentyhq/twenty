import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultWorkspaceId1734544295083
  implements MigrationInterface
{
  name = 'RemoveDefaultWorkspaceId1734544295083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "defaultWorkspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8" UNIQUE ("subdomain")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_e6fa363bdaf45cbf8ce97bcebf0" UNIQUE ("domainName")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "defaultWorkspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}

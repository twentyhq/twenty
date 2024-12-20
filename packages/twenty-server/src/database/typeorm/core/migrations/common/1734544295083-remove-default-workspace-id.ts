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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "defaultWorkspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}

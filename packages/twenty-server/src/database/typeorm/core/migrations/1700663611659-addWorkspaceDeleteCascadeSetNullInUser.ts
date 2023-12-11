import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceDeleteCascadeSetNullInUser1700663611659
  implements MigrationInterface
{
  name = 'AddWorkspaceDeleteCascadeSetNullInUser1700663611659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

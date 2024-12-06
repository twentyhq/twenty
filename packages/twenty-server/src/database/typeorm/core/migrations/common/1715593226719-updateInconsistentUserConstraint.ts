import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInconsistentUserConstraint1715593226719
  implements MigrationInterface
{
  name = 'UpdateInconsistentUserConstraint1715593226719';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "subscriptionStatus" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "FK_2ec910029395fa7655621c88908" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "core"."workspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}

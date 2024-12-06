import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserEmailUniqueConstraint1733408604468
  implements MigrationInterface
{
  name = 'FixUserEmailUniqueConstraint1733408604468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "UQ_USER_EMAIL"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."UQ_USER_EMAIL"`);
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "UQ_USER_EMAIL" UNIQUE ("email", "deletedAt")`,
    );
  }
}

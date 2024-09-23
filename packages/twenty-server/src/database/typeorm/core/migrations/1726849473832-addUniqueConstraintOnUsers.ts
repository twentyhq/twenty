import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintOnUsers1726849473832
  implements MigrationInterface
{
  name = 'AddUniqueConstraintOnUsers1726849473832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "UQ_USER_EMAIL" UNIQUE ("email", "deletedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "UQ_USER_EMAIL"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintOnUserEmail1726842156293
  implements MigrationInterface
{
  name = 'AddUniqueConstraintOnUserEmail1726842156293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
    );
  }
}

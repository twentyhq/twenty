import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexOnSubdomain1734355945585
  implements MigrationInterface
{
  name = 'AddUniqueIndexOnSubdomain1734355945585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8" UNIQUE ("subdomain")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8"`,
    );
  }
}

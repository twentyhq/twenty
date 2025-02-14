import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsCustomDomainEnable1739203087254
  implements MigrationInterface
{
  name = 'AddIsCustomDomainEnable1739203087254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isCustomDomainEnabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "isCustomDomainEnabled"`,
    );
  }
}

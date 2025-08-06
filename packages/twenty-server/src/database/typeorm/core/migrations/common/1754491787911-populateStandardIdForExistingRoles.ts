import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateStandardIdForExistingRoles1754491787911
  implements MigrationInterface
{
  name = 'PopulateStandardIdForExistingRoles1754491787911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."role" SET "standardId" = '20202020-0001-0001-0001-000000000001' WHERE "label" = 'Admin'`,
    );

    await queryRunner.query(
      `UPDATE "core"."role" SET "standardId" = '20202020-0001-0001-0001-000000000002' WHERE "label" = 'Member'`,
    );

    await queryRunner.query(
      `UPDATE "core"."role" SET "standardId" = '20202020-0001-0001-0001-000000000003' WHERE "label" = 'Guest'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "core"."role" SET "standardId" = NULL`);
  }
}

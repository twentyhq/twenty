import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameRouteToRouteTrigger1759418198310
  implements MigrationInterface
{
  name = 'RenameRouteToRouteTrigger1759418198310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."route" RENAME TO "routeTrigger"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."route_httpmethod_enum" RENAME TO "routeTrigger_httpmethod_enum"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_1c39502392dd9cbb186deba158" RENAME TO "IDX_e9c53b9ac5035d3202a8737020"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_e9c53b9ac5035d3202a8737020" RENAME TO "IDX_1c39502392dd9cbb186deba158"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."routeTrigger_httpmethod_enum" RENAME TO "route_httpmethod_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" RENAME TO "route"`,
    );
  }
}

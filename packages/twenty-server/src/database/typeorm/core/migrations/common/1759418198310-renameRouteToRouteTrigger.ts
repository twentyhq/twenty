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
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_c63b1110bbf09051be2f495d0be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "IDX_ROUTE_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "IDX_ROUTE_TRIGGER_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE" UNIQUE ("path", "httpMethod", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "FK_c89ed9d929873119478fc0d9cc5" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_c89ed9d929873119478fc0d9cc5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "IDX_ROUTE_TRIGGER_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "IDX_ROUTE_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE" UNIQUE ("path", "httpMethod", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "FK_c63b1110bbf09051be2f495d0be" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
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

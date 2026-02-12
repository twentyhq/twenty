import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeViewFilterUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768213174273-makeViewFilterUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeViewFilterUniversalIdentifierAndApplicationIdNotNullable1768213174273
  implements MigrationInterface
{
  name =
    'MakeViewFilterUniversalIdentifierAndApplicationIdNotNullable1768213174273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_view_filter_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeViewFilterUniversalIdentifierAndApplicationIdNotNullableQueries(
        queryRunner,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in MakeViewFilterUniversalIdentifierAndApplicationIdNotNullable1768213174273',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeViewFilterUniversalIdentifierAndApplicationIdNotNullable1768213174273 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd4588bfc9ad73345b3953a039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cd4588bfc9ad73345b3953a039" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

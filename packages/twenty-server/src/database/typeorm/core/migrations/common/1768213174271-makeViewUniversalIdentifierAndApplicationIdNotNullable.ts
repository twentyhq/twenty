import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeViewUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768213174271-makeViewUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeViewUniversalIdentifierAndApplicationIdNotNullable1768213174271
  implements MigrationInterface
{
  name = 'MakeViewUniversalIdentifierAndApplicationIdNotNullable1768213174271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_view_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeViewUniversalIdentifierAndApplicationIdNotNullableQueries(
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
          'Failed to rollback to savepoint in MakeViewUniversalIdentifierAndApplicationIdNotNullable1768213174271',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeViewUniversalIdentifierAndApplicationIdNotNullable1768213174271 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_348e25d584c7e51417f4e097941"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_552aa6908966e980099b3e5ebf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_552aa6908966e980099b3e5ebf" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_348e25d584c7e51417f4e097941" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

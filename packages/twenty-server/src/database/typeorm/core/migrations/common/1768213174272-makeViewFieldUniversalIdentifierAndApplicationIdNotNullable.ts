import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeViewFieldUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768213174272-makeViewFieldUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeViewFieldUniversalIdentifierAndApplicationIdNotNullable1768213174272
  implements MigrationInterface
{
  name =
    'MakeViewFieldUniversalIdentifierAndApplicationIdNotNullable1768213174272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_view_field_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeViewFieldUniversalIdentifierAndApplicationIdNotNullableQueries(
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
          'Failed to rollback to savepoint in MakeViewFieldUniversalIdentifierAndApplicationIdNotNullable1768213174272',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeViewFieldUniversalIdentifierAndApplicationIdNotNullable1768213174272 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_b560ea62a958deff0c6059caa45"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b86af4ea24cae518dee8eae996"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b86af4ea24cae518dee8eae996" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_b560ea62a958deff0c6059caa45" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

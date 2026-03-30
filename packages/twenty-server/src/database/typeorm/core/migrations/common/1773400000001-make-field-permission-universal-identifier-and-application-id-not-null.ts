import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773400000000-make-field-permission-universal-identifier-and-application-id-not-null.util';

export class MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNull1773400000001
  implements MigrationInterface
{
  name =
    'MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNull1773400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_field_permission_universal_identifier_and_application_id_not_null';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeFieldPermissionUniversalIdentifierAndApplicationIdNotNullQueries(
        queryRunner,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // oxlint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNull1773400000001',
          rollbackError,
        );
        throw rollbackError;
      }

      // oxlint-disable-next-line no-console
      console.error(
        'Swallowing MakeFieldPermissionUniversalIdentifierAndApplicationIdNotNull1773400000001 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT IF EXISTS "FK_71cc60c4a1c9f8a7c434d91d38c"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_0dedb90c717e179ef653c512b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
  }
}

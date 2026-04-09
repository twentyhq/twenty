import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773232418467-make-permission-flag-universal-identifier-and-application-id-not-null.util';

export class MakePermissionFlagUniversalIdentifierAndApplicationIdNotNull1773232418468
  implements MigrationInterface
{
  name =
    'MakePermissionFlagUniversalIdentifierAndApplicationIdNotNull1773232418468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_permission_flag_universal_identifier_and_application_id_not_null';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makePermissionFlagUniversalIdentifierAndApplicationIdNotNullQueries(
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
          'Failed to rollback to savepoint in MakePermissionFlagUniversalIdentifierAndApplicationIdNotNull1773232418468',
          rollbackError,
        );
        throw rollbackError;
      }

      // oxlint-disable-next-line no-console
      console.error(
        'Swallowing MakePermissionFlagUniversalIdentifierAndApplicationIdNotNull1773232418468 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT IF EXISTS "FK_b26a9d39a88d0e72373c677c6c5"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
  }
}

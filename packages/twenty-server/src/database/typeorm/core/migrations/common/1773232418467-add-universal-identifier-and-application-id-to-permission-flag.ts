import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { addPermissionFlagUniversalIdentifierAndApplicationIdColumns } from 'src/database/typeorm/core/migrations/utils/1773232418467-add-universal-identifier-and-application-id-to-permission-flag.util';

export class AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_add_permission_flag_universal_identifier_and_application_id';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await addPermissionFlagUniversalIdentifierAndApplicationIdColumns(
        queryRunner,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (error) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // oxlint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467',
          rollbackError,
        );
        throw rollbackError;
      }

      throw error;
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
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}

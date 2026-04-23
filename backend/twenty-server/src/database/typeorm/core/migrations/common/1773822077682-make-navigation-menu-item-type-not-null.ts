import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeNavigationMenuItemTypeNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1773681736596-makeNavigationMenuItemTypeNotNull.util';

export class MakeNavigationMenuItemTypeNotNull1773822077682
  implements MigrationInterface
{
  name = 'MakeNavigationMenuItemTypeNotNull1773822077682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_make_navigation_menu_item_type_not_null';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeNavigationMenuItemTypeNotNullQueries(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // oxlint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in MakeNavigationMenuItemTypeNotNull1773822077682',
          rollbackError,
        );
        throw rollbackError;
      }

      // oxlint-disable-next-line no-console
      console.error(
        'Swallowing MakeNavigationMenuItemTypeNotNull1773822077682 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "CHK_navigation_menu_item_type_fields"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP NOT NULL`,
    );
  }
}

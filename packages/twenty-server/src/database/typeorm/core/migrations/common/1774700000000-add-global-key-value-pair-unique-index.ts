import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { addGlobalKeyValuePairUniqueIndexQueries } from 'src/database/typeorm/core/migrations/utils/1774700000000-add-global-key-value-pair-unique-index.util';

export class AddGlobalKeyValuePairUniqueIndex1774700000000
  implements MigrationInterface
{
  name = 'AddGlobalKeyValuePairUniqueIndex1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_add_global_key_value_pair_unique_index';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await addGlobalKeyValuePairUniqueIndexQueries(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // oxlint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddGlobalKeyValuePairUniqueIndex1774700000000',
          rollbackError,
        );
        throw rollbackError;
      }

      // oxlint-disable-next-line no-console
      console.error(
        'Swallowing AddGlobalKeyValuePairUniqueIndex1774700000000 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE"`,
    );
  }
}

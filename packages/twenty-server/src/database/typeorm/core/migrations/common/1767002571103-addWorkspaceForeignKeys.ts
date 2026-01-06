import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { addWorkspaceForeignKeysQueries } from 'src/database/typeorm/core/migrations/utils/1767002571103-addWorkspaceForeignKeys.util';

export class AddWorkspaceForeignKeys1767002571103
  implements MigrationInterface
{
  name = 'AddWorkspaceForeignKeys1767002571103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_add_workspace_foreign_keys';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await addWorkspaceForeignKeysQueries(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddWorkspaceForeignKeys1767002571103',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error('Swallowing AddWorkspaceForeignKeys1767002571103 error', e);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."remoteServer" DROP CONSTRAINT "FK_d1293835c5a0bb89fc0ed45713f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."remoteTable" DROP CONSTRAINT "FK_30b429b14ddc6aab7495fa884f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceMigration" DROP CONSTRAINT "FK_bebfcf8dcb299fd39ad04ed4c7f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" DROP CONSTRAINT "FK_ca0699c3c906e903d7381c6a771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT "FK_835bc9f7ef959debfc5cd268049"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_edcd87df18d3284141757bf6e16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" DROP CONSTRAINT "FK_e1914827ee8b22fba4254578311"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_ef5dde6a681970b9c1e10563498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_5e004929fcf5e67398544b43885"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_cf158c3199dcf2d52b0da05c33b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_058c319eeb9799a4637908ce362"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_d82a05a204136c01388ea80bc7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_9ce5ba7878f498bcf79e447a9a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_d2532f520d84f8c22ee45681c5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_a86894bed7b7e1cc8b3f1d6186f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_5c988136a6d6f25a100c1064789"`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeRoleUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768213174275-makeRoleUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeRoleUniversalIdentifierAndApplicationIdNotNullable1768213174275
  implements MigrationInterface
{
  name = 'MakeRoleUniversalIdentifierAndApplicationIdNotNullable1768213174275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_role_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeRoleUniversalIdentifierAndApplicationIdNotNullableQueries(
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
          'Failed to rollback to savepoint in MakeRoleUniversalIdentifierAndApplicationIdNotNullable1768213174275',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeRoleUniversalIdentifierAndApplicationIdNotNullable1768213174275 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3b7ff27925c0959777682c1adc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3b7ff27925c0959777682c1adc" ON "core"."role" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

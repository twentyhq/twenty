import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeAgentUniversalIdentifierAndApplicationIdNotNullableQueries } from 'src/database/typeorm/core/migrations/utils/1768213174274-makeAgentUniversalIdentifierAndApplicationIdNotNullable.util';

export class MakeAgentUniversalIdentifierAndApplicationIdNotNullable1768213174274
  implements MigrationInterface
{
  name = 'MakeAgentUniversalIdentifierAndApplicationIdNotNullable1768213174274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_agent_universal_identifier_and_application_id_not_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeAgentUniversalIdentifierAndApplicationIdNotNullableQueries(
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
          'Failed to rollback to savepoint in MakeAgentUniversalIdentifierAndApplicationIdNotNullable1768213174274',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeAgentUniversalIdentifierAndApplicationIdNotNullable1768213174274 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0cc4d03dbcc269e77ba4d297fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0cc4d03dbcc269e77ba4d297fb" ON "core"."agent" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

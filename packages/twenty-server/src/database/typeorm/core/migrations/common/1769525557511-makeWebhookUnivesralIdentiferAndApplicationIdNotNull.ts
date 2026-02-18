import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { makeWebhookUniversalIdentifierAndApplicationIdNotNullQueries } from 'src/database/typeorm/core/migrations/utils/1769525557511-makeWebhookUniversalIdentifierAndApplicationIdNotNull.util';

export class MakeWebhookUnivesralIdentiferAndApplicationIdNotNull1769525557511
  implements MigrationInterface
{
  name = 'MakeWebhookUnivesralIdentiferAndApplicationIdNotNull1769525557511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName =
      'sp_make_webhook_universal_identifier_and_application_id_not_null';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await makeWebhookUniversalIdentifierAndApplicationIdNotNullQueries(
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
          'Failed to rollback to savepoint in MakeWebhookUnivesralIdentiferAndApplicationIdNotNull1769525557511',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing MakeWebhookUnivesralIdentiferAndApplicationIdNotNull1769525557511 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_e755f49a9ef74b36e27932f7a6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_d48d713d01cc3c81bad1f39795"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ALTER COLUMN "applicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ALTER COLUMN "universalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d48d713d01cc3c81bad1f39795" ON "core"."webhook" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_e755f49a9ef74b36e27932f7a6c" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

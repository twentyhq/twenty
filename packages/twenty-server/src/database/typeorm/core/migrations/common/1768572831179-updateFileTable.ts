import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { updateFileTableQueries } from 'src/database/typeorm/core/migrations/utils/1768572831179-updateFileTable.util';

export class UpdateFileTable1768572831179 implements MigrationInterface {
  name = 'UpdateFileTable1768572831179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_update_file_table';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await updateFileTableQueries(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in UpdateFileTable1768572831179',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error('Swallowing UpdateFileTable1768572831179 error', e);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_413aaaf293284c3c0266d0bab3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "isStaticAsset"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."file" DROP COLUMN "path"`);
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "type" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "fullPath" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD "name" character varying NOT NULL`,
    );
  }
}

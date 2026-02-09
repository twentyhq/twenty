import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFileEntityUniqueConstraint1770032815802
  implements MigrationInterface
{
  name = 'AddFileEntityUniqueConstraint1770032815802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_add_file_entity_unique_constraint';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await queryRunner.query(
        `ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")`,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddFileEntityUniqueConstraint1770032815802',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing AddFileEntityUniqueConstraint1770032815802 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE"`,
    );
  }
}

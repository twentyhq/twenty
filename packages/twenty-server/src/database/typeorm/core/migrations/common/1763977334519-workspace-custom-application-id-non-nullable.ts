import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class WorkspaceCustomApplicationIdNonNullable1763977334519
  implements MigrationInterface
{
  name = 'WorkspaceCustomApplicationIdNonNullable1763977334519';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_workspace_custom_application_id_non_nullable';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await queryRunner.query(
        `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" SET NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in WorkspaceCustomApplicationIdNonNullable1763977334519',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing WorkspaceCustomApplicationIdNonNullable1763977334519 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}

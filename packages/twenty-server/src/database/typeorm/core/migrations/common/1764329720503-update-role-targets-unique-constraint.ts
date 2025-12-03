import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateRoleTargetsUniqueConstraint1764329720503
  implements MigrationInterface
{
  name = 'UpdateRoleTargetsUniqueConstraint1764329720503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_update_role_targets_unique_constraint';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await queryRunner.query(
        `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_API_KEY" UNIQUE ("workspaceId", "apiKeyId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_AGENT" UNIQUE ("workspaceId", "agentId")`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE" UNIQUE ("workspaceId", "userWorkspaceId")`,
      );

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in UpdateRoleTargetsUniqueConstraint1764329720503',
          rollbackError,
        );
        throw rollbackError;
      }

      // eslint-disable-next-line no-console
      console.error(
        'Swallowing UpdateRoleTargetsUniqueConstraint1764329720503 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_AGENT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_API_KEY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("workspaceId", "userWorkspaceId", "agentId", "apiKeyId")`,
    );
  }
}

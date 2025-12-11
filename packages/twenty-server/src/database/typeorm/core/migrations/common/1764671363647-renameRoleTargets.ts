import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameRoleTargets1764671363647 implements MigrationInterface {
  name = 'RenameRoleTargets1764671363647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename table from roleTargets to roleTarget
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" RENAME TO "roleTarget"`,
    );

    // Rename check constraint
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "CHK_role_targets_single_entity" TO "CHK_role_target_single_entity"`,
    );

    // Rename indexes
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_WORKSPACE_ID" RENAME TO "IDX_ROLE_TARGET_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_AGENT_ID" RENAME TO "IDX_ROLE_TARGET_AGENT_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_API_KEY_ID" RENAME TO "IDX_ROLE_TARGET_API_KEY_ID"`,
    );

    // FK
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_d4fcfdc3cd562a3e81fa9f0dae5"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3e571e80f99488686015f3d00c"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0082568653b80c15903c5a2ba9" ON "core"."roleTarget" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_b1db027b64f44029389ace305ac" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_83ea4a0433da5007a198db7667e" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_4b3865868c7da0747ee8e480851" FOREIGN KEY ("apiKeyId") REFERENCES "core"."apiKey"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // FK
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_4b3865868c7da0747ee8e480851"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_83ea4a0433da5007a198db7667e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_b1db027b64f44029389ace305ac"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0082568653b80c15903c5a2ba9"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3e571e80f99488686015f3d00c" ON "core"."roleTarget" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_d4fcfdc3cd562a3e81fa9f0dae5" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331" FOREIGN KEY ("apiKeyId") REFERENCES "core"."apiKey"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Rename indexes back
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_API_KEY_ID" RENAME TO "IDX_ROLE_TARGETS_API_KEY_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_AGENT_ID" RENAME TO "IDX_ROLE_TARGETS_AGENT_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGET_WORKSPACE_ID" RENAME TO "IDX_ROLE_TARGETS_WORKSPACE_ID"`,
    );

    // Rename check constraint back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "CHK_role_target_single_entity" TO "CHK_role_targets_single_entity"`,
    );

    // Rename unique constraints back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_API_KEY" TO "IDX_ROLE_TARGETS_UNIQUE_API_KEY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_AGENT" TO "IDX_ROLE_TARGETS_UNIQUE_AGENT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE" TO "IDX_ROLE_TARGETS_UNIQUE_USER_WORKSPACE"`,
    );

    // Rename table back
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" RENAME TO "roleTargets"`,
    );
  }
}

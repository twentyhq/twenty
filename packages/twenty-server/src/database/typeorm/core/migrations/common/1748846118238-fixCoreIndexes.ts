import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCoreIndexes1748846118238 implements MigrationInterface {
  name = 'FixCoreIndexes1748846118238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnKeyUserIdAndNullWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnKeyWorkspaceIdAndNullUserIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "IndexOnKeyUserIdWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" DROP CONSTRAINT "IndexOnDomainAndWorkspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "IndexOnKeyAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key", "userId") WHERE "workspaceId" is NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" is NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "userId", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" ADD CONSTRAINT "IDX_APPROVED_ACCESS_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" DROP CONSTRAINT "IDX_APPROVED_ACCESS_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_USER_ID_NULL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "IndexOnKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" ADD CONSTRAINT "IndexOnDomainAndWorkspaceId" UNIQUE ("domain", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "IndexOnKeyUserIdWorkspaceIdUnique" UNIQUE ("userId", "workspaceId", "key")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnKeyWorkspaceIdAndNullUserIdUnique" ON "core"."keyValuePair" ("workspaceId", "key") WHERE ("userId" IS NULL)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnKeyUserIdAndNullWorkspaceIdUnique" ON "core"."keyValuePair" ("userId", "key") WHERE ("workspaceId" IS NULL)`,
    );
  }
}

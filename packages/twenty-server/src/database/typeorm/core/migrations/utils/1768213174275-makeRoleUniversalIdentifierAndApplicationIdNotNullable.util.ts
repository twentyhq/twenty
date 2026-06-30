import { type QueryRunner } from 'typeorm';

export const makeRoleUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3b7ff27925c0959777682c1adc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3b7ff27925c0959777682c1adc" ON "core"."role" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };

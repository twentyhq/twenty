import { type QueryRunner } from 'typeorm';

export const makeAgentUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0cc4d03dbcc269e77ba4d297fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0cc4d03dbcc269e77ba4d297fb" ON "core"."agent" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };

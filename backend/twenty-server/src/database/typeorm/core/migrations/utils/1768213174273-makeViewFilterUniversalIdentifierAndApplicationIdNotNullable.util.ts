import { type QueryRunner } from 'typeorm';

export const makeViewFilterUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd4588bfc9ad73345b3953a039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cd4588bfc9ad73345b3953a039" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };

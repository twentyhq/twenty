import { type QueryRunner } from 'typeorm';

export const makeViewUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_348e25d584c7e51417f4e097941"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_552aa6908966e980099b3e5ebf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_552aa6908966e980099b3e5ebf" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_348e25d584c7e51417f4e097941" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };

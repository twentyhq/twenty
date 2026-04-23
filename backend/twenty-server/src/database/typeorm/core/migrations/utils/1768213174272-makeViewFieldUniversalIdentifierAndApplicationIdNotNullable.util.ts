import { type QueryRunner } from 'typeorm';

export const makeViewFieldUniversalIdentifierAndApplicationIdNotNullableQueries =
  async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_b560ea62a958deff0c6059caa45"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b86af4ea24cae518dee8eae996"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b86af4ea24cae518dee8eae996" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_b560ea62a958deff0c6059caa45" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  };

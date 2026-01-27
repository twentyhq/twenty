import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameServerless1769556947746 implements MigrationInterface {
  name = 'RenameServerless1769556947746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" RENAME TO "logicFunctionLayer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" RENAME TO "logicFunction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "serverlessFunctionLayerId" TO "logicFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultServerlessFunctionRoleId" TO "defaultLogicFunctionRoleId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_LOGIC_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SERVERLESS_FUNCTION_LAYER_ID" RENAME TO "IDX_LOGIC_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP CONSTRAINT "FK_ca0699c3c906e903d7381c6a771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_ef5dde6a681970b9c1e10563498"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_5b43e65e322d516c9307bed97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "CHK_4a5179975ee017934a91703247"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2f0fd3da807fb993701619d0ac" ON "core"."logicFunction" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "CHK_349d2959a97c0b14fa0bf7cadd" CHECK ("timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900)`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ADD CONSTRAINT "FK_0a2947ca6a9adefa41eb62b2322" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_a6ff4745db9bbe5a9616cfdfd5b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_daed3cd4d8048fbe85646874615" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_87e3f7b8f23cd90709e127f60c5" FOREIGN KEY ("logicFunctionLayerId") REFERENCES "core"."logicFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_87e3f7b8f23cd90709e127f60c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_daed3cd4d8048fbe85646874615"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "FK_a6ff4745db9bbe5a9616cfdfd5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP CONSTRAINT "FK_0a2947ca6a9adefa41eb62b2322"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT "CHK_349d2959a97c0b14fa0bf7cadd"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2f0fd3da807fb993701619d0ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "CHK_4a5179975ee017934a91703247" CHECK ((("timeoutSeconds" >= 1) AND ("timeoutSeconds" <= 900)))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b43e65e322d516c9307bed97a" ON "core"."logicFunction" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_ef5dde6a681970b9c1e10563498" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_62cbd26626ff76df897181c7994" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("logicFunctionLayerId") REFERENCES "core"."logicFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" ADD CONSTRAINT "FK_ca0699c3c906e903d7381c6a771" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_LAYER_ID" RENAME TO "IDX_SERVERLESS_FUNCTION_LAYER_ID"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_LOGIC_FUNCTION_ID_DELETED_AT" RENAME TO "IDX_SERVERLESS_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultLogicFunctionRoleId" TO "defaultServerlessFunctionRoleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME COLUMN "logicFunctionLayerId" TO "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" RENAME TO "serverlessFunction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" RENAME TO "serverlessFunctionLayer"`,
    );
  }
}

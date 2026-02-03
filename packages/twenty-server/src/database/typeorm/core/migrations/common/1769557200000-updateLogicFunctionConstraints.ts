import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateLogicFunctionConstraints1769557200000
  implements MigrationInterface
{
  name = 'UpdateLogicFunctionConstraints1769557200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunctionLayer" DROP CONSTRAINT IF EXISTS "FK_ca0699c3c906e903d7381c6a771"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "FK_ef5dde6a681970b9c1e10563498"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_5b43e65e322d516c9307bed97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP CONSTRAINT IF EXISTS "CHK_4a5179975ee017934a91703247"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_2f0fd3da807fb993701619d0ac" ON "core"."logicFunction" ("workspaceId", "universalIdentifier") `,
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
  }
}

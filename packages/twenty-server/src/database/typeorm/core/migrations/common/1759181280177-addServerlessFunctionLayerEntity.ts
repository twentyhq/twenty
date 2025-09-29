import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddServerlessFunctionLayerEntity1759181280177
  implements MigrationInterface
{
  name = 'AddServerlessFunctionLayerEntity1759181280177';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."serverlessFunctionLayer" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "packageJson" jsonb NOT NULL, "yarnLock" text NOT NULL, "checksum" text NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a1077708d1b19463ab2eda7c246" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_60f54307131652687a70a3c90c" ON "core"."serverlessFunctionLayer" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageJson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "yarnLock"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "packageChecksum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "serverlessFunctionLayerId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "serverlessFunctionLayerId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "UQ_eec488855d08b312a869a13ccb1" UNIQUE ("serverlessFunctionLayerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE" ON "core"."application" ("standardId", "workspaceId") WHERE "deletedAt" IS NULL AND "standardId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_eec488855d08b312a869a13ccb1" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_eec488855d08b312a869a13ccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_STANDARD_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "UQ_eec488855d08b312a869a13ccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "serverlessFunctionLayerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageChecksum" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "yarnLock" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "packageJson" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_60f54307131652687a70a3c90c"`,
    );
    await queryRunner.query(`DROP TABLE "core"."serverlessFunctionLayer"`);
  }
}

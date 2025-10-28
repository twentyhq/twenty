import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateServerlessFunctionLayerEntity1759236947406
  implements MigrationInterface
{
  name = 'UpdateServerlessFunctionLayerEntity1759236947406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."serverlessFunctionLayer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "packageJson" jsonb NOT NULL, "yarnLock" text NOT NULL, "checksum" text NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a1077708d1b19463ab2eda7c246" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_62cbd26626ff76df897181c7994" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_eec488855d08b312a869a13ccb1" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_eec488855d08b312a869a13ccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_4b9625a4babf7f4fa942fd26514"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_259c48f99f625708723414adb5d"`,
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
    await queryRunner.query(`DROP TABLE "core"."serverlessFunctionLayer"`);
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}

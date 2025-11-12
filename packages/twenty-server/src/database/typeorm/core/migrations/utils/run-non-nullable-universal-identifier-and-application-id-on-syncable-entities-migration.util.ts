import { type QueryRunner } from 'typeorm';

export const runNonNullableUniversalIdentifierAndApplicationIdOnSyncableEntitiesMigration =
  async ({ queryRunner }: { queryRunner: QueryRunner }) => {
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
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_056363e1599f5b9a0e33323d9da"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
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
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_bfc3498b964ef1bfc89b1f2bee3"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6ed40a61e4584e98584019a47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_5aff384532c78fa8a42ceeae282"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a44e3b03f0eca32d0504d5ef73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_ff8cbebe1704954120df82bf393"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_38232fc0c6567ed029c2b1a12c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
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
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_05453a954e458e3d91f2ff5043f"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_f1c88fdfc3ad8910b17fc1fd73"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3a00d35710f4227ded320fd96d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_817ea28e71e3b19acc258dd7dcd"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_8adc1fd6cb0dad2fbfd945954d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_9acc2804037a5c885633024368d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_960465af116edf9ac501bfb3db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_6edf47a8bfe17a5811998dc7162"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e9c53b9ac5035d3202a8737020"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP CONSTRAINT "FK_62cbd26626ff76df897181c7994"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_5b43e65e322d516c9307bed97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "universalIdentifier" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "applicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "workspaceCustomApplicationId" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0cc4d03dbcc269e77ba4d297fb" ON "core"."agent" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3b7ff27925c0959777682c1adc" ON "core"."role" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cd4588bfc9ad73345b3953a039" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6ed40a61e4584e98584019a47" ON "core"."viewFilterGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a44e3b03f0eca32d0504d5ef73" ON "core"."viewGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_38232fc0c6567ed029c2b1a12c" ON "core"."viewSort" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_552aa6908966e980099b3e5ebf" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b86af4ea24cae518dee8eae996" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f1c88fdfc3ad8910b17fc1fd73" ON "core"."fieldMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3a00d35710f4227ded320fd96d" ON "core"."objectMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8adc1fd6cb0dad2fbfd945954d" ON "core"."cronTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_960465af116edf9ac501bfb3db" ON "core"."databaseEventTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e9c53b9ac5035d3202a8737020" ON "core"."routeTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b43e65e322d516c9307bed97a" ON "core"."serverlessFunction" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_259c48f99f625708723414adb5d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_056363e1599f5b9a0e33323d9da" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_bfc3498b964ef1bfc89b1f2bee3" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_5aff384532c78fa8a42ceeae282" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_ff8cbebe1704954120df82bf393" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_348e25d584c7e51417f4e097941" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_b560ea62a958deff0c6059caa45" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_05453a954e458e3d91f2ff5043f" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_71a7af5a5c916f0b96f358f25f7" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_817ea28e71e3b19acc258dd7dcd" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_9acc2804037a5c885633024368d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD CONSTRAINT "FK_6edf47a8bfe17a5811998dc7162" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD CONSTRAINT "FK_62cbd26626ff76df897181c7994" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  };

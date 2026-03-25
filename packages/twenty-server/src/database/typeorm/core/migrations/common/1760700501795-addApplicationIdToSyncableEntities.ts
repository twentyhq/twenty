import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationIdToSyncableEntities1760700501795
  implements MigrationInterface
{
  name = 'AddApplicationIdToSyncableEntities1760700501795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_eec488855d08b312a869a13ccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "UQ_eec488855d08b312a869a13ccb1"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0cc4d03dbcc269e77ba4d297fb" ON "core"."agent" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3b7ff27925c0959777682c1adc" ON "core"."role" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3a00d35710f4227ded320fd96d" ON "core"."objectMetadata" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f1c88fdfc3ad8910b17fc1fd73" ON "core"."fieldMetadata" ("workspaceId", "universalIdentifier") `,
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
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_056363e1599f5b9a0e33323d9da" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_05453a954e458e3d91f2ff5043f" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_b560ea62a958deff0c6059caa45" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP CONSTRAINT "FK_6edf47a8bfe17a5811998dc7162"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_9acc2804037a5c885633024368d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_817ea28e71e3b19acc258dd7dcd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_b560ea62a958deff0c6059caa45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_05453a954e458e3d91f2ff5043f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_056363e1599f5b9a0e33323d9da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_348e25d584c7e51417f4e097941"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_ff8cbebe1704954120df82bf393"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_5aff384532c78fa8a42ceeae282"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_bfc3498b964ef1bfc89b1f2bee3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_d5651cf33fa56a47cd262a3fb2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP CONSTRAINT "FK_7f3b96f15aaf5a27549288d264b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_f1c88fdfc3ad8910b17fc1fd73"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3a00d35710f4227ded320fd96d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3b7ff27925c0959777682c1adc"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_0cc4d03dbcc269e77ba4d297fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "UQ_eec488855d08b312a869a13ccb1" UNIQUE ("serverlessFunctionLayerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."routeTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_eec488855d08b312a869a13ccb1" FOREIGN KEY ("serverlessFunctionLayerId") REFERENCES "core"."serverlessFunctionLayer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

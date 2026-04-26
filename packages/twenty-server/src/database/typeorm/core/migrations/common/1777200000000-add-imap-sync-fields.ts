import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImapSyncFields1777200000000 implements MigrationInterface {
  name = 'AddImapSyncFields1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to messageChannel
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD "highestUid" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD "uidValidity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD "modSeq" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" ADD "firstSyncedUid" integer`,
    );

    // Add columns to messageFolder
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD "highestUid" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD "uidValidity" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD "modSeq" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" ADD "firstSyncedUid" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns from messageFolder
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP COLUMN "firstSyncedUid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP COLUMN "modSeq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP COLUMN "uidValidity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageFolder" DROP COLUMN "highestUid"`,
    );

    // Remove columns from messageChannel
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP COLUMN "firstSyncedUid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP COLUMN "modSeq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP COLUMN "uidValidity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."messageChannel" DROP COLUMN "highestUid"`,
    );
  }
}

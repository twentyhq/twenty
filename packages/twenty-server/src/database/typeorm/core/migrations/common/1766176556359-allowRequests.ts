import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AllowRequests1766176556359 implements MigrationInterface {
  name = 'AllowRequests1766176556359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "allowRequests" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "allowRequests"`,
    );
  }
}

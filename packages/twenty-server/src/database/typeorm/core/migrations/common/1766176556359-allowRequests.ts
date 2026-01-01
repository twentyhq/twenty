import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AllowExternalRequests1766176556359 implements MigrationInterface {
  name = 'AllowExternalRequests1766176556359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "allowExternalRequests" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "allowExternalRequests"`,
    );
  }
}

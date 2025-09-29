import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class DropUselessDeletedAt1759153773252 implements MigrationInterface {
  name = 'DropUselessDeletedAt1759153773252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "deletedAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }
}

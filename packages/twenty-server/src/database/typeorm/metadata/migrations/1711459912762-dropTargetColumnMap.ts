import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTargetColumnMap1711459912762 implements MigrationInterface {
  name = 'DropTargetColumnMap1711459912762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "targetColumnMap"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "targetColumnMap" jsonb NOT NULL`,
    );
  }
}

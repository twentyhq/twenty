import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDelete1723038077987 implements MigrationInterface {
  name = 'AddSoftDelete1723038077987';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "isSoftDeletable" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "isSoftDeletable"`,
    );
  }
}

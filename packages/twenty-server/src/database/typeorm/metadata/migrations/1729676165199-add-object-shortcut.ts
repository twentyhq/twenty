import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectShortcut1729676165199 implements MigrationInterface {
  name = 'AddObjectShortcut1729676165199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "shortcut" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "shortcut"`,
    );
  }
}

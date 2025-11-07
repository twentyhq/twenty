import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditableProfileFields1762488656872 implements MigrationInterface {
  name = 'EditableProfileFields1762488656872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "editableProfileFields" text DEFAULT 'email'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "editableProfileFields"`,
    );
  }
}

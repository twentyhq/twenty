import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class EditableProfileFields1762884796640 implements MigrationInterface {
  name = 'EditableProfileFields1762884796640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "editableProfileFields" character varying array DEFAULT '{email,profilePicture,firstName,lastName}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "editableProfileFields"`,
    );
  }
}

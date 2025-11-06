import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditableProfileFields1762440785035 implements MigrationInterface {
  name = 'EditableProfileFields1762440785035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "editableProfileFields" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "editableProfileFields"`,
    );
  }
}

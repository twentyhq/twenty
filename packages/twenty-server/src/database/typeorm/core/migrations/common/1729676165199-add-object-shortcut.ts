import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddObjectShortcut1729676165199 implements MigrationInterface {
  name = 'AddObjectShortcut1729676165199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "shortcut" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_objectMetadata_shortcut_upper_workspace" ON "core"."objectMetadata" (UPPER("shortcut"), "workspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_objectMetadata_shortcut_upper_workspace"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "shortcut"`,
    );
  }
}

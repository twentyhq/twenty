import { MigrationInterface, QueryRunner } from 'typeorm';

export class MissingShortcutMigration1733318004066
  implements MigrationInterface
{
  name = 'MissingShortcutMigration1733318004066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "metadata"."IDX_objectMetadata_shortcut_upper_workspace"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_objectMetadata_shortcut_upper_workspace" ON "metadata"."objectMetadata" ("workspaceId") `,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceForeignKeyToSearchFieldMetadata1757809958470
  implements MigrationInterface
{
  name = 'AddWorkspaceForeignKeyToSearchFieldMetadata1757809958470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" ADD CONSTRAINT "FK_5f10e00da471e19f52513f47d8b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."searchFieldMetadata" DROP CONSTRAINT "FK_5f10e00da471e19f52513f47d8b"`,
    );
  }
}

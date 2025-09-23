import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierToIndexMetadata1758038863448
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierToIndexMetadata1758038863448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b27c681286ac581f81498c5d4b" ON "core"."indexMetadata" ("workspaceId", "universalIdentifier") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b27c681286ac581f81498c5d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "universalIdentifier"`,
    );
  }
}

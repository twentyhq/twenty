import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierToViewTables1756393156589
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierToViewTables1756393156589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD "universalIdentifier" text`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."viewFilterGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."viewGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."viewSort" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_UNIQUE_IDENTIFIER" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_UNIQUE_IDENTIFIER"`);
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "universalIdentifier"`,
    );
  }
}

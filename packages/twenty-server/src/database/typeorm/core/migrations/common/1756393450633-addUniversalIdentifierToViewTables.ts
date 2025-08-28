import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierToViewTables1756393450633
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierToViewTables1756393450633';

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
      `CREATE UNIQUE INDEX "IDX_cd4588bfc9ad73345b3953a039" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6ed40a61e4584e98584019a47" ON "core"."viewFilterGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a44e3b03f0eca32d0504d5ef73" ON "core"."viewGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_38232fc0c6567ed029c2b1a12c" ON "core"."viewSort" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_552aa6908966e980099b3e5ebf" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b86af4ea24cae518dee8eae996" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b86af4ea24cae518dee8eae996"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_552aa6908966e980099b3e5ebf"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_38232fc0c6567ed029c2b1a12c"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a44e3b03f0eca32d0504d5ef73"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6ed40a61e4584e98584019a47"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd4588bfc9ad73345b3953a039"`,
    );
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

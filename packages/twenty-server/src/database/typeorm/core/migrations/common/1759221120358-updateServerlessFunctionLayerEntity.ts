import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateServerlessFunctionLayerEntity1759221120358
  implements MigrationInterface
{
  name = 'UpdateServerlessFunctionLayerEntity1759221120358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_60f54307131652687a70a3c90c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" DROP COLUMN "workspaceId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" ADD "workspaceId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunctionLayer" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_60f54307131652687a70a3c90c" ON "core"."serverlessFunctionLayer" ("universalIdentifier", "workspaceId") `,
    );
  }
}

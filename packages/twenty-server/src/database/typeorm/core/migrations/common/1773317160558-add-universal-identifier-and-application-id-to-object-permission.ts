import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558
  implements MigrationInterface
{
  name =
    'AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "universalIdentifier" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "applicationId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c5ea53618b32558fe24e495f21" ON "core"."objectPermission" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_f2ecee1066fd43800dbc85f87e4" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_f2ecee1066fd43800dbc85f87e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_c5ea53618b32558fe24e495f21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN "universalIdentifier"`,
    );
  }
}

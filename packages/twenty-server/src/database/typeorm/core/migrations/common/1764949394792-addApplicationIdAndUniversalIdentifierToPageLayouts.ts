import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationIdAndUniversalIdentifierToPageLayouts1764949394792
  implements MigrationInterface
{
  name = 'AddApplicationIdAndUniversalIdentifierToPageLayouts1764949394792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2a33a0e7e44c393ca7bb578dae" ON "core"."pageLayoutWidget" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3763c4e8f942ff1e24040a13a9" ON "core"."pageLayoutTab" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_fb84d310b4cfe5916ced6fc3e2a" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_4493447c2e4029aa26cabf30460" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_4493447c2e4029aa26cabf30460"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_fb84d310b4cfe5916ced6fc3e2a"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3763c4e8f942ff1e24040a13a9"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2a33a0e7e44c393ca7bb578dae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "universalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN "universalIdentifier"`,
    );
  }
}

import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCanBeUninstalledColumnToApplication1763731277403
  implements MigrationInterface
{
  name = 'AddCanBeUninstalledColumnToApplication1763731277403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "canBeUninstalled" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "canBeUninstalled"`,
    );
  }
}

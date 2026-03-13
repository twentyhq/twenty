import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIsSdkLayerStaleToApplication1773000000000
  implements MigrationInterface
{
  name = 'AddIsSdkLayerStaleToApplication1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "isSdkLayerStale" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "isSdkLayerStale"`,
    );
  }
}

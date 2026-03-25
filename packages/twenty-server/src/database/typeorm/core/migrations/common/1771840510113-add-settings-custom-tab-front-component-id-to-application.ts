import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddSettingsCustomTabFrontComponentIdToApplication1771840510113
  implements MigrationInterface
{
  name = 'AddSettingsCustomTabFrontComponentIdToApplication1771840510113';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "settingsCustomTabFrontComponentId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "settingsCustomTabFrontComponentId"`,
    );
  }
}

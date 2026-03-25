import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAiModelAvailabilityColumns1771768847449
  implements MigrationInterface
{
  name = 'AddAiModelAvailabilityColumns1771768847449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "autoEnableNewAiModels" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "disabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "enabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "enabledAiModelIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "disabledAiModelIds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "autoEnableNewAiModels"`,
    );
  }
}

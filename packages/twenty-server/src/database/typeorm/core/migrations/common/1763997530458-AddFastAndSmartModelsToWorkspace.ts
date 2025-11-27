import { type MigrationInterface, type QueryRunner } from 'typeorm';

import {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';

export class AddFastAndSmartModelsToWorkspace1763997530458
  implements MigrationInterface
{
  name = 'AddFastAndSmartModelsToWorkspace1763997530458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "fastModel" character varying NOT NULL DEFAULT '${DEFAULT_FAST_MODEL}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "smartModel" character varying NOT NULL DEFAULT '${DEFAULT_SMART_MODEL}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "smartModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "fastModel"`,
    );
  }
}

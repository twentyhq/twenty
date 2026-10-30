import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793358115816)
export class RenameWorkspaceAllowedIframeOriginsToAllowedEmbeddingOriginsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'core'
            AND table_name = 'workspace'
            AND column_name = 'allowedIframeOrigins'
        ) THEN
          ALTER TABLE "core"."workspace"
            RENAME COLUMN "allowedIframeOrigins" TO "allowedEmbeddingOrigins";
        END IF;
      END
      $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" RENAME COLUMN "allowedEmbeddingOrigins" TO "allowedIframeOrigins"',
    );
  }
}

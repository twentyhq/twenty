import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const SAAS_AUTH_BUSINESS_ID_INDEX_NAME =
  'IDX_WORKSPACE_SAAS_AUTH_BUSINESS_ID';

@RegisteredInstanceCommand('2.16.0', 1782300000000)
export class AddSaasAuthBusinessIdToWorkspaceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD COLUMN IF NOT EXISTS "saasAuthBusinessId" varchar',
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${SAAS_AUTH_BUSINESS_ID_INDEX_NAME}" ON "core"."workspace" ("saasAuthBusinessId") WHERE "saasAuthBusinessId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${SAAS_AUTH_BUSINESS_ID_INDEX_NAME}"`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN IF EXISTS "saasAuthBusinessId"',
    );
  }
}

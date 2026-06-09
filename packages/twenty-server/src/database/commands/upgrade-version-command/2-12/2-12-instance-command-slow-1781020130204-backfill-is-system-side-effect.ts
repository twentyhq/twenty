import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const SYSTEM_SIDE_EFFECT_TABLES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'navigationMenuItem',
  'commandMenuItem',
] as const;

@RegisteredInstanceCommand('2.12.0', 1781020130204, { type: 'slow' })
export class BackfillIsSystemSideEffectSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const table of SYSTEM_SIDE_EFFECT_TABLES) {
      await dataSource.query(
        `UPDATE "core"."${table}" e
         SET "isSystemSideEffect" = true
         FROM "core"."workspace" w
         WHERE e."workspaceId" = w."id"
           AND e."applicationId" <> w."workspaceCustomApplicationId"`,
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

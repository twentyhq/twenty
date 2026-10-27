import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const APPLICATION_WRITABILITY_DISABLED_ACTIONS = [
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
];

@RegisteredInstanceCommand('2.53.0', 1793129132000, { type: 'slow' })
export class MoveApplicationWritabilityToDisabledActionsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."objectMetadata"
       SET "writability" = 'OPEN',
           "disabledObjectPermissionActions" = (
             SELECT jsonb_agg(DISTINCT "action" ORDER BY "action")
             FROM jsonb_array_elements_text(
               COALESCE("disabledObjectPermissionActions", '[]'::jsonb) || $1::jsonb
             ) AS "action"
           )
       WHERE "writability" = 'APPLICATION'`,
      [JSON.stringify(APPLICATION_WRITABILITY_DISABLED_ACTIONS)],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}

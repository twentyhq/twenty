import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const BASE_EMIT_SLOT_INDEX_NAME =
  'IDX_TIMELINE_ACTIVITY_TYPE_BASE_EMIT_SLOT_UNIQUE';
const OVERRIDE_EMIT_SLOT_INDEX_NAME =
  'IDX_TIMELINE_ACTIVITY_TYPE_OVERRIDE_EMIT_SLOT_UNIQUE';

@RegisteredInstanceCommand('2.34.0', 1787471608316)
export class EnforceTimelineActivityTypeEmitUniquenessFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "${BASE_EMIT_SLOT_INDEX_NAME}" ON "core"."timelineActivityType" ("workspaceId", "action", "objectUniversalIdentifier", "targetRelationFieldUniversalIdentifier") NULLS NOT DISTINCT WHERE "action" IS NOT NULL AND "replacesTimelineActivityTypeUniversalIdentifier" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "${OVERRIDE_EMIT_SLOT_INDEX_NAME}" ON "core"."timelineActivityType" ("workspaceId", "action", "objectUniversalIdentifier", "targetRelationFieldUniversalIdentifier") NULLS NOT DISTINCT WHERE "action" IS NOT NULL AND "replacesTimelineActivityTypeUniversalIdentifier" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."${OVERRIDE_EMIT_SLOT_INDEX_NAME}"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."${BASE_EMIT_SLOT_INDEX_NAME}"`,
    );
  }
}

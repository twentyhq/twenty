import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const rewriteCronTriggers = ({
  isTriggerToRewrite,
  rewrittenTrigger,
}: {
  isTriggerToRewrite: string;
  rewrittenTrigger: string;
}) => `
  UPDATE "core"."workflowVersion" AS "workflowVersion"
  SET "triggers" = (
    SELECT jsonb_agg(
      CASE WHEN ${isTriggerToRewrite} THEN ${rewrittenTrigger} ELSE "trigger" END
      ORDER BY "position"
    )
    FROM jsonb_array_elements("workflowVersion"."triggers")
      WITH ORDINALITY AS "element"("trigger", "position")
  )
  WHERE jsonb_typeof("workflowVersion"."triggers") = 'array'
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements("workflowVersion"."triggers") AS "element"("trigger")
      WHERE ${isTriggerToRewrite}
    )
`;

const SCHEDULE = `"trigger"->'settings'->'schedule'`;

// Same templates the schedule editor uses; a malformed draft gets an empty pattern to fix in the editor
const CRON_PATTERN_FROM_SCHEDULE = `COALESCE(
  CASE "trigger"->'settings'->>'type'
    WHEN 'CUSTOM' THEN "trigger"->'settings'->>'pattern'
    WHEN 'DAYS' THEN (${SCHEDULE}->>'minute') || ' ' || (${SCHEDULE}->>'hour') || ' */' || (${SCHEDULE}->>'day') || ' * *'
    WHEN 'HOURS' THEN (${SCHEDULE}->>'minute') || ' */' || (${SCHEDULE}->>'hour') || ' * * *'
    WHEN 'MINUTES' THEN '*/' || (${SCHEDULE}->>'minute') || ' * * * *'
  END,
  ''
)`;

@RegisteredInstanceCommand('2.59.0', 1794488413613)
export class ConvertWorkflowCronTriggersToPatternFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      rewriteCronTriggers({
        isTriggerToRewrite: `"trigger"->>'type' = 'CRON' AND "trigger"->'settings' ? 'type'`,
        rewrittenTrigger: `jsonb_set(
          "trigger",
          '{settings}',
          (("trigger"->'settings') - 'type' - 'schedule')
            || jsonb_build_object('pattern', ${CRON_PATTERN_FROM_SCHEDULE})
        )`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      rewriteCronTriggers({
        isTriggerToRewrite: `"trigger"->>'type' = 'CRON' AND NOT ("trigger"->'settings' ? 'type')`,
        rewrittenTrigger: `jsonb_set("trigger", '{settings,type}', '"CUSTOM"')`,
      }),
    );
  }
}

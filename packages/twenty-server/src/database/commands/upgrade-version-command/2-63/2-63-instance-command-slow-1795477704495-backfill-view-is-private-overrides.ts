import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795477704495, { type: 'slow' })
export class BackfillViewIsPrivateOverridesSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."view" SET "overrides" = CASE
        WHEN "overrides" ? 'visibility'
          THEN "overrides" || jsonb_build_object('isPrivate', "overrides"->>'visibility' = 'UNLISTED')
        ELSE (
          SELECT jsonb_object_agg(
            "author",
            CASE
              WHEN jsonb_typeof("entry") = 'object' AND "entry" ? 'visibility'
                THEN "entry" || jsonb_build_object('isPrivate', "entry"->>'visibility' = 'UNLISTED')
              ELSE "entry"
            END
          )
          FROM jsonb_each("overrides") AS "authoredOverride"("author", "entry")
        )
      END
      WHERE jsonb_typeof("overrides") = 'object'
        AND (
          "overrides" ? 'visibility'
          OR EXISTS (
            SELECT 1
            FROM jsonb_each("overrides") AS "authoredOverride"("author", "entry")
            WHERE jsonb_typeof("entry") = 'object' AND "entry" ? 'visibility'
          )
        )`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."view" SET "overrides" = CASE
        WHEN "overrides" ? 'isPrivate' THEN "overrides" - 'isPrivate'
        ELSE (
          SELECT jsonb_object_agg(
            "author",
            CASE
              WHEN jsonb_typeof("entry") = 'object' THEN "entry" - 'isPrivate'
              ELSE "entry"
            END
          )
          FROM jsonb_each("overrides") AS "authoredOverride"("author", "entry")
        )
      END
      WHERE jsonb_typeof("overrides") = 'object'`,
    );
  }
}

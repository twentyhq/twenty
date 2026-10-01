import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Override entries are nested per author (or flat for legacy rows) and only
// hold uuids as values, so matching the quoted key followed by ":" renames
// keys at any depth without touching values.
const renameViewOverrideKeysQuery = (renames: [string, string][]) => {
  const renamedOverridesText = renames.reduce(
    (expression, [from, to]) =>
      `replace(${expression}, '"${from}":', '"${to}":')`,
    '"overrides"::text',
  );
  const matchesAnyKey = renames
    .map(([from]) => `"overrides"::text LIKE '%"${from}":%'`)
    .join(' OR ');

  return `UPDATE "core"."view" SET "overrides" = (${renamedOverridesText})::jsonb WHERE "overrides" IS NOT NULL AND (${matchesAnyKey})`;
};

@RegisteredInstanceCommand('2.45.0', 1790829838873)
export class RenameViewCalendarFieldsToStartAndEndFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_CALENDAR_INTEGRITY"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME COLUMN "calendarFieldMetadataId" TO "startFieldMetadataId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME COLUMN "calendarEndFieldMetadataId" TO "endFieldMetadataId"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_VIEW_CALENDAR_FIELD_METADATA" RENAME TO "IDX_VIEW_START_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_VIEW_CALENDAR_END_FIELD_METADATA" RENAME TO "IDX_VIEW_END_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME CONSTRAINT "FK_5c0d21d6b8d5544a24ab9787114" TO "FK_456045f79f0451e27d406d08da3"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME CONSTRAINT "FK_e1d69dd7402cd7df3b03ce11311" TO "FK_ce2547d8dfa1287014f75fc7541"',
    );
    await queryRunner.query(
      renameViewOverrideKeysQuery([
        ['calendarFieldMetadataId', 'startFieldMetadataId'],
        ['calendarEndFieldMetadataId', 'endFieldMetadataId'],
      ]),
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK ("type" NOT IN ('CALENDAR', 'CALENDAR_WIDGET') OR ("calendarLayout" IS NOT NULL AND "startFieldMetadataId" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_CALENDAR_INTEGRITY"',
    );
    await queryRunner.query(
      renameViewOverrideKeysQuery([
        ['startFieldMetadataId', 'calendarFieldMetadataId'],
        ['endFieldMetadataId', 'calendarEndFieldMetadataId'],
      ]),
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME CONSTRAINT "FK_ce2547d8dfa1287014f75fc7541" TO "FK_e1d69dd7402cd7df3b03ce11311"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME CONSTRAINT "FK_456045f79f0451e27d406d08da3" TO "FK_5c0d21d6b8d5544a24ab9787114"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_VIEW_END_FIELD_METADATA" RENAME TO "IDX_VIEW_CALENDAR_END_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_VIEW_START_FIELD_METADATA" RENAME TO "IDX_VIEW_CALENDAR_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME COLUMN "endFieldMetadataId" TO "calendarEndFieldMetadataId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" RENAME COLUMN "startFieldMetadataId" TO "calendarFieldMetadataId"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK ("type" NOT IN ('CALENDAR', 'CALENDAR_WIDGET') OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL))`,
    );
  }
}

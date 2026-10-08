import { type ActivityTargetColumn } from 'src/database/commands/upgrade-version-command/2-38/utils/resolve-activity-target-columns.util';

export const buildDuplicateActivityTargetQuery = ({
  schemaName,
  tableName,
  parentColumnName,
  targetColumns,
  deleteDuplicates,
}: {
  schemaName: string;
  tableName: string;
  parentColumnName: string;
  targetColumns: ActivityTargetColumn[];
  deleteDuplicates: boolean;
}) => `
  WITH "rankedTargets" AS (
    SELECT
      "activityTarget"."id",
      ROW_NUMBER() OVER (
        PARTITION BY
          "activityTarget"."${parentColumnName}",
          "target"."type",
          "target"."id"
        ORDER BY
          ("activityTarget"."deletedAt" IS NULL) DESC,
          "activityTarget"."createdAt",
          "activityTarget"."id"
      ) AS "duplicateRank"
    FROM "${schemaName}"."${tableName}" "activityTarget"
    CROSS JOIN LATERAL (
      VALUES
${targetColumns
  .map(
    ({ type, columnName }) =>
      `        ('${type}', "activityTarget"."${columnName}")`,
  )
  .join(',\n')}
    ) AS "target"("type", "id")
    WHERE "target"."id" IS NOT NULL
  ),
  "duplicateTargets" AS (
    SELECT DISTINCT "id"
    FROM "rankedTargets"
    WHERE "duplicateRank" > 1
  )${
    deleteDuplicates
      ? `,
  "deletedTargets" AS (
    DELETE FROM "${schemaName}"."${tableName}"
    WHERE "id" IN (SELECT "id" FROM "duplicateTargets")
    RETURNING "id"
  )
  SELECT COUNT(*)::integer AS "count" FROM "deletedTargets"`
      : '\n  SELECT COUNT(*)::integer AS "count" FROM "duplicateTargets"'
  }`;

export const buildTimelineActivityTypeSnapshotBackfillQuery = ({
  schemaName,
  batchSize,
  afterTimelineActivityId,
}: {
  schemaName: string;
  batchSize: number;
  afterTimelineActivityId: string | null;
}): { sql: string; parameters: [string | null, number] } => ({
  sql: `WITH rows_to_update AS (
  SELECT
    timeline_activity."id" AS "timelineActivityId",
    timeline_activity_type."id" AS "timelineActivityTypeId",
    timeline_activity_type."universalIdentifier",
    timeline_activity_type."name",
    timeline_activity_type."label",
    timeline_activity_type."action",
    timeline_activity_type."icon",
    timeline_activity_type."objectUniversalIdentifier",
    timeline_activity_type."frontComponentUniversalIdentifier"
  FROM "${schemaName}"."timelineActivity" timeline_activity
  INNER JOIN "core"."timelineActivityType" timeline_activity_type
    ON timeline_activity_type."id" = timeline_activity."timelineActivityTypeId"
  WHERE timeline_activity."timelineActivityTypeSnapshot" IS NULL
    AND ($1::uuid IS NULL OR timeline_activity."id" > $1::uuid)
  ORDER BY timeline_activity."id"
  LIMIT $2
)
UPDATE "${schemaName}"."timelineActivity" timeline_activity
SET "timelineActivityTypeSnapshot" = jsonb_build_object(
  'id', rows_to_update."timelineActivityTypeId",
  'universalIdentifier', rows_to_update."universalIdentifier",
  'name', rows_to_update."name",
  'label', rows_to_update."label",
  'action', rows_to_update."action",
  'icon', rows_to_update."icon",
  'objectUniversalIdentifier', rows_to_update."objectUniversalIdentifier",
  'frontComponentUniversalIdentifier', rows_to_update."frontComponentUniversalIdentifier"
)
FROM rows_to_update
WHERE timeline_activity."id" = rows_to_update."timelineActivityId"
RETURNING timeline_activity."id"`,
  parameters: [afterTimelineActivityId, batchSize],
});

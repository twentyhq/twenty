const PAIR_CTE = `pair AS (
  SELECT * FROM unnest($1::uuid[], $2::uuid[]) AS pair("duplicateId", "keeperId")
)`;

export const buildCalendarEventMergeQueries = (schemaName: string): string[] => [
  `SELECT 1
FROM "${schemaName}"."calendarEvent"
WHERE "id" = ANY($1::uuid[]) OR "id" = ANY($2::uuid[])
ORDER BY "id"
FOR UPDATE`,
  `WITH ${PAIR_CTE}
UPDATE "${schemaName}"."calendarChannelEventAssociation" association
SET "calendarEventId" = pair."keeperId"
FROM pair
WHERE association."calendarEventId" = pair."duplicateId"`,
  `WITH ${PAIR_CTE}, moved_participant AS (
  SELECT DISTINCT ON (pair."keeperId", participant."handle")
    participant."id",
    pair."keeperId"
  FROM "${schemaName}"."calendarEventParticipant" participant
  INNER JOIN pair ON pair."duplicateId" = participant."calendarEventId"
  WHERE NOT EXISTS (
    SELECT 1
    FROM "${schemaName}"."calendarEventParticipant" kept_participant
    WHERE kept_participant."calendarEventId" = pair."keeperId"
      AND kept_participant."handle" = participant."handle"
  )
  ORDER BY pair."keeperId", participant."handle", participant."id"
)
UPDATE "${schemaName}"."calendarEventParticipant" participant
SET "calendarEventId" = moved_participant."keeperId"
FROM moved_participant
WHERE participant."id" = moved_participant."id"`,
  `WITH ${PAIR_CTE}, moved_target AS (
  SELECT DISTINCT ON (pair."keeperId", target."targetPersonId", target."targetCompanyId", target."targetOpportunityId")
    target."id",
    pair."keeperId"
  FROM "${schemaName}"."calendarEventTarget" target
  INNER JOIN pair ON pair."duplicateId" = target."calendarEventId"
  WHERE target."deletedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM "${schemaName}"."calendarEventTarget" kept_target
      WHERE kept_target."calendarEventId" = pair."keeperId"
        AND kept_target."deletedAt" IS NULL
        AND kept_target."targetPersonId" IS NOT DISTINCT FROM target."targetPersonId"
        AND kept_target."targetCompanyId" IS NOT DISTINCT FROM target."targetCompanyId"
        AND kept_target."targetOpportunityId" IS NOT DISTINCT FROM target."targetOpportunityId"
    )
  ORDER BY pair."keeperId", target."targetPersonId", target."targetCompanyId", target."targetOpportunityId", target."id"
)
UPDATE "${schemaName}"."calendarEventTarget" target
SET "calendarEventId" = moved_target."keeperId"
FROM moved_target
WHERE target."id" = moved_target."id"`,
  `WITH ${PAIR_CTE}
UPDATE "${schemaName}"."callRecording" call_recording
SET "calendarEventId" = pair."keeperId"
FROM pair
WHERE call_recording."calendarEventId" = pair."duplicateId"`,
  `WITH ${PAIR_CTE}
DELETE FROM "${schemaName}"."timelineActivity" timeline_activity
USING pair
WHERE timeline_activity."linkedRecordId" = pair."duplicateId"`,
  `WITH ${PAIR_CTE}
DELETE FROM "${schemaName}"."calendarEvent" calendar_event
USING pair
WHERE calendar_event."id" = pair."duplicateId"`,
];

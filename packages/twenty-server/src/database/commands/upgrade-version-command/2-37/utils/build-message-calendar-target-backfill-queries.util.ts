type TargetBackfillQuery = {
  label: string;
  countSql: string;
  insertSql: string;
};

const buildTargetBackfillQuery = ({
  batchSize,
  candidateFromSql,
  label,
  parentColumnName,
  schemaName,
  targetColumnName,
  targetTableName,
}: {
  batchSize: number;
  candidateFromSql: string;
  label: string;
  parentColumnName: 'calendarEventId' | 'messageThreadId';
  schemaName: string;
  targetColumnName:
    | 'targetPersonId'
    | 'targetCompanyId'
    | 'targetOpportunityId';
  targetTableName: 'calendarEventTarget' | 'messageThreadTarget';
}): TargetBackfillQuery => {
  const candidateSql = `SELECT DISTINCT source."parentId", source."targetId"
${candidateFromSql}
WHERE source."parentId" IS NOT NULL
  AND source."targetId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "${schemaName}"."${targetTableName}" existing_target
    WHERE existing_target."${parentColumnName}" = source."parentId"
      AND existing_target."${targetColumnName}" = source."targetId"
  )`;

  return {
    label,
    countSql: `SELECT COUNT(*)::int AS "count" FROM (${candidateSql}) candidates`,
    insertSql: `WITH candidates AS (
  ${candidateSql}
  ORDER BY source."parentId", source."targetId"
  LIMIT ${batchSize}
), inserted AS (
  INSERT INTO "${schemaName}"."${targetTableName}" (
    "${parentColumnName}",
    "${targetColumnName}",
    "isAutomaticallyAssigned",
    "isManuallyAssigned"
  )
  SELECT "parentId", "targetId", TRUE, FALSE
  FROM candidates
  ON CONFLICT DO NOTHING
  RETURNING "id"
)
SELECT
  (SELECT COUNT(*)::int FROM candidates) AS "candidateCount",
  (SELECT COUNT(*)::int FROM inserted) AS "insertedCount"`,
  };
};

export const buildMessageCalendarTargetBackfillQueries = ({
  batchSize,
  schemaName,
}: {
  batchSize: number;
  schemaName: string;
}): TargetBackfillQuery[] => [
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'calendar event person targets',
    targetTableName: 'calendarEventTarget',
    parentColumnName: 'calendarEventId',
    targetColumnName: 'targetPersonId',
    candidateFromSql: `FROM (
  SELECT participant."calendarEventId" AS "parentId", participant."personId" AS "targetId"
  FROM "${schemaName}"."calendarEventParticipant" participant
  INNER JOIN "${schemaName}"."calendarEvent" calendar_event ON calendar_event."id" = participant."calendarEventId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  WHERE participant."deletedAt" IS NULL
    AND calendar_event."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
) source`,
  }),
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'calendar event company targets',
    targetTableName: 'calendarEventTarget',
    parentColumnName: 'calendarEventId',
    targetColumnName: 'targetCompanyId',
    candidateFromSql: `FROM (
  SELECT participant."calendarEventId" AS "parentId", person."companyId" AS "targetId"
  FROM "${schemaName}"."calendarEventParticipant" participant
  INNER JOIN "${schemaName}"."calendarEvent" calendar_event ON calendar_event."id" = participant."calendarEventId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  INNER JOIN "${schemaName}"."company" company ON company."id" = person."companyId"
  WHERE participant."deletedAt" IS NULL
    AND calendar_event."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
    AND company."deletedAt" IS NULL
) source`,
  }),
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'calendar event opportunity targets',
    targetTableName: 'calendarEventTarget',
    parentColumnName: 'calendarEventId',
    targetColumnName: 'targetOpportunityId',
    candidateFromSql: `FROM (
  SELECT participant."calendarEventId" AS "parentId", opportunity."id" AS "targetId"
  FROM "${schemaName}"."calendarEventParticipant" participant
  INNER JOIN "${schemaName}"."calendarEvent" calendar_event ON calendar_event."id" = participant."calendarEventId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  INNER JOIN "${schemaName}"."opportunity" opportunity ON opportunity."pointOfContactId" = participant."personId"
  WHERE participant."deletedAt" IS NULL
    AND calendar_event."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
    AND opportunity."deletedAt" IS NULL
) source`,
  }),
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'message thread person targets',
    targetTableName: 'messageThreadTarget',
    parentColumnName: 'messageThreadId',
    targetColumnName: 'targetPersonId',
    candidateFromSql: `FROM (
  SELECT message."messageThreadId" AS "parentId", participant."personId" AS "targetId"
  FROM "${schemaName}"."messageParticipant" participant
  INNER JOIN "${schemaName}"."message" message ON message."id" = participant."messageId"
  INNER JOIN "${schemaName}"."messageThread" message_thread ON message_thread."id" = message."messageThreadId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  WHERE participant."deletedAt" IS NULL
    AND message."deletedAt" IS NULL
    AND message_thread."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
) source`,
  }),
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'message thread company targets',
    targetTableName: 'messageThreadTarget',
    parentColumnName: 'messageThreadId',
    targetColumnName: 'targetCompanyId',
    candidateFromSql: `FROM (
  SELECT message."messageThreadId" AS "parentId", person."companyId" AS "targetId"
  FROM "${schemaName}"."messageParticipant" participant
  INNER JOIN "${schemaName}"."message" message ON message."id" = participant."messageId"
  INNER JOIN "${schemaName}"."messageThread" message_thread ON message_thread."id" = message."messageThreadId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  INNER JOIN "${schemaName}"."company" company ON company."id" = person."companyId"
  WHERE participant."deletedAt" IS NULL
    AND message."deletedAt" IS NULL
    AND message_thread."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
    AND company."deletedAt" IS NULL
) source`,
  }),
  buildTargetBackfillQuery({
    batchSize,
    schemaName,
    label: 'message thread opportunity targets',
    targetTableName: 'messageThreadTarget',
    parentColumnName: 'messageThreadId',
    targetColumnName: 'targetOpportunityId',
    candidateFromSql: `FROM (
  SELECT message."messageThreadId" AS "parentId", opportunity."id" AS "targetId"
  FROM "${schemaName}"."messageParticipant" participant
  INNER JOIN "${schemaName}"."message" message ON message."id" = participant."messageId"
  INNER JOIN "${schemaName}"."messageThread" message_thread ON message_thread."id" = message."messageThreadId"
  INNER JOIN "${schemaName}"."person" person ON person."id" = participant."personId"
  INNER JOIN "${schemaName}"."opportunity" opportunity ON opportunity."pointOfContactId" = participant."personId"
  WHERE participant."deletedAt" IS NULL
    AND message."deletedAt" IS NULL
    AND message_thread."deletedAt" IS NULL
    AND person."deletedAt" IS NULL
    AND opportunity."deletedAt" IS NULL
) source`,
  }),
];

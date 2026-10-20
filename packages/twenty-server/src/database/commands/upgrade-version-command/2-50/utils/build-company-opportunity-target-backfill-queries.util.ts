type CompanyOpportunityTargetBackfillQuery = {
  label: string;
  countSql: string;
  insertSql: string;
};

export const buildCompanyOpportunityTargetBackfillQueries = ({
  schemaName,
  batchSize,
}: {
  schemaName: string;
  batchSize: number;
}): CompanyOpportunityTargetBackfillQuery[] =>
  (['messageThread', 'calendarEvent'] as const).map((parentName) => {
    const isMessage = parentName === 'messageThread';
    const targetTableName = `${parentName}Target`;
    const parentColumnName = `${parentName}Id`;
    const participantTableName = isMessage
      ? 'messageParticipant'
      : 'calendarEventParticipant';
    const parentJoinSql = isMessage
      ? `INNER JOIN "${schemaName}"."message" message
    ON message."id" = participant."messageId" AND message."deletedAt" IS NULL
  INNER JOIN "${schemaName}"."messageThread" parent
    ON parent."id" = message."messageThreadId"`
      : `INNER JOIN "${schemaName}"."calendarEvent" parent
    ON parent."id" = participant."calendarEventId"`;
    const candidatesSql = `SELECT DISTINCT parent."id" AS "parentId", opportunity."id" AS "opportunityId"
  FROM "${schemaName}"."${participantTableName}" participant
  INNER JOIN "${schemaName}"."person" person
    ON person."id" = participant."personId" AND person."deletedAt" IS NULL
  INNER JOIN "${schemaName}"."opportunity" opportunity
    ON opportunity."companyId" = person."companyId"
    AND opportunity."deletedAt" IS NULL
  ${parentJoinSql}
  WHERE participant."deletedAt" IS NULL
    AND parent."deletedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "${schemaName}"."${targetTableName}" existing_target
      WHERE existing_target."${parentColumnName}" = parent."id"
        AND existing_target."targetOpportunityId" = opportunity."id"
    )`;

    return {
      label: isMessage
        ? 'message thread company opportunity targets'
        : 'calendar event company opportunity targets',
      countSql: `SELECT COUNT(*)::int AS "count" FROM (${candidatesSql}) candidates`,
      insertSql: `WITH candidates AS (
  ${candidatesSql}
  ORDER BY parent."id", opportunity."id"
  LIMIT ${batchSize}
), inserted AS (
  INSERT INTO "${schemaName}"."${targetTableName}" (
    "${parentColumnName}", "targetOpportunityId", "isAutomaticallyAssigned", "isManuallyAssigned"
  )
  SELECT "parentId", "opportunityId", TRUE, FALSE FROM candidates
  ON CONFLICT DO NOTHING
  RETURNING "id"
)
SELECT (SELECT COUNT(*)::int FROM candidates) AS "candidateCount",
  (SELECT COUNT(*)::int FROM inserted) AS "insertedCount"`,
    };
  });

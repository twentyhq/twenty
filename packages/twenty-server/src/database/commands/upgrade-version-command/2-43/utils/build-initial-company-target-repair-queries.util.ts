type CompanyTargetRepairQuery = {
  label: string;
  countSql: string;
  insertSql: string;
};

export const buildInitialCompanyTargetRepairQueries = ({
  schemaName,
  batchSize,
}: {
  schemaName: string;
  batchSize: number;
}): CompanyTargetRepairQuery[] => {
  // A null before-value must be recorded explicitly. Missing audit data does
  // not establish an initial assignment, and multiple changes are ambiguous.
  const assignmentsSql = `WITH initial_assignments AS MATERIALIZED (
  SELECT activity."targetPersonId" AS "personId",
    MIN(activity."happensAt") AS "assignedAt",
    MIN(activity."properties" #>> '{diff,company,after,id}') AS "companyId"
  FROM "${schemaName}"."timelineActivity" activity
  WHERE activity."targetPersonId" IS NOT NULL
    AND activity."linkedRecordId" IS NULL
    AND activity."properties" #> '{diff,company}' IS NOT NULL
  GROUP BY activity."targetPersonId"
  HAVING COUNT(*) = 1
    AND BOOL_AND(activity."deletedAt" IS NULL)
    AND BOOL_AND(activity."properties" #> '{diff,company,before,id}' = 'null'::jsonb)
)`;

  return (['messageThread', 'calendarEvent'] as const).map((parentName) => {
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
    const candidatesSql = `SELECT DISTINCT parent."id" AS "parentId", company."id" AS "companyId"
  FROM initial_assignments assignment
  INNER JOIN "${schemaName}"."person" person
    ON person."id" = assignment."personId"
    AND person."companyId"::text = assignment."companyId"
    AND person."deletedAt" IS NULL
  INNER JOIN "${schemaName}"."company" company
    ON company."id" = person."companyId" AND company."deletedAt" IS NULL
  INNER JOIN "${schemaName}"."${participantTableName}" participant
    ON participant."personId" = person."id"
    AND participant."deletedAt" IS NULL
    AND participant."createdAt" <= assignment."assignedAt"
  ${parentJoinSql}
  WHERE parent."deletedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "${schemaName}"."${targetTableName}" existing_target
      WHERE existing_target."${parentColumnName}" = parent."id"
        AND existing_target."targetCompanyId" = company."id"
    )`;

    // Existing rows include tombstones; the repair must never resurrect an
    // explicitly removed attribution or rewrite another company's provenance.
    return {
      label: isMessage
        ? 'message thread company targets'
        : 'calendar event company targets',
      countSql: `${assignmentsSql}
SELECT COUNT(*)::int AS "count" FROM (${candidatesSql}) candidates`,
      insertSql: `${assignmentsSql}, candidates AS (
  ${candidatesSql}
  ORDER BY parent."id", company."id"
  LIMIT ${batchSize}
), inserted AS (
  INSERT INTO "${schemaName}"."${targetTableName}" (
    "${parentColumnName}", "targetCompanyId", "isAutomaticallyAssigned", "isManuallyAssigned"
  )
  SELECT "parentId", "companyId", TRUE, FALSE FROM candidates
  ON CONFLICT DO NOTHING
  RETURNING "id"
)
SELECT (SELECT COUNT(*)::int FROM candidates) AS "candidateCount",
  (SELECT COUNT(*)::int FROM inserted) AS "insertedCount"`,
    };
  });
};

import { isDefined } from 'twenty-shared/utils';

import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

type ReferencingColumn = {
  tableName: string;
  columnName: string;
};

const PAIR_CTE = `pair AS (
  SELECT * FROM unnest($1::uuid[], $2::uuid[]) AS pair("duplicateId", "keeperId")
), merged_event AS (
  SELECT "duplicateId" AS "calendarEventId", "keeperId" FROM pair
  UNION
  SELECT "keeperId", "keeperId" FROM pair
), calendar_event_object AS (
  SELECT $3::uuid AS "id"
)`;

const buildExtraPartitionColumns = ({
  alias,
  columnNames,
}: {
  alias: string;
  columnNames: string[];
}): string =>
  columnNames.map((columnName) => `, ${alias}."${columnName}"`).join('');

const buildRepointQuery = ({
  schemaName,
  tableName,
  columnName,
}: ReferencingColumn & { schemaName: string }): string => `WITH ${PAIR_CTE}
UPDATE "${schemaName}"."${tableName}" referencing_row
SET "${columnName}" = pair."keeperId"
FROM pair
WHERE referencing_row."${columnName}" = pair."duplicateId"`;

const buildParticipantMergeQuery = (
  schemaName: string,
): string => `WITH ${PAIR_CTE}, candidate AS (
  SELECT
    participant."id",
    merged_event."keeperId",
    participant."handle",
    participant."personId",
    participant."workspaceMemberId",
    participant."isOrganizer",
    row_number() OVER (
      PARTITION BY merged_event."keeperId", participant."handle"
      ORDER BY
        participant."responseStatus" <> '${CalendarEventParticipantResponseStatus.NEEDS_ACTION}' DESC,
        participant."updatedAt" DESC,
        participant."id"
    ) AS "rank"
  FROM "${schemaName}"."calendarEventParticipant" participant
  INNER JOIN merged_event ON merged_event."calendarEventId" = participant."calendarEventId"
  WHERE participant."deletedAt" IS NULL
    AND participant."handle" <> ''
), merged_participant AS (
  SELECT
    "keeperId",
    "handle",
    (array_agg("personId" ORDER BY "rank") FILTER (WHERE "personId" IS NOT NULL))[1] AS "personId",
    (array_agg("workspaceMemberId" ORDER BY "rank") FILTER (WHERE "workspaceMemberId" IS NOT NULL))[1] AS "workspaceMemberId",
    bool_or("isOrganizer") AS "isOrganizer"
  FROM candidate
  GROUP BY "keeperId", "handle"
), deleted_participant AS (
  DELETE FROM "${schemaName}"."calendarEventParticipant"
  WHERE "id" IN (SELECT "id" FROM candidate WHERE "rank" > 1)
)
UPDATE "${schemaName}"."calendarEventParticipant" participant
SET
  "calendarEventId" = merged_participant."keeperId",
  "personId" = merged_participant."personId",
  "workspaceMemberId" = merged_participant."workspaceMemberId",
  "isOrganizer" = merged_participant."isOrganizer"
FROM candidate
INNER JOIN merged_participant
  ON merged_participant."keeperId" = candidate."keeperId"
  AND merged_participant."handle" = candidate."handle"
WHERE participant."id" = candidate."id"
  AND candidate."rank" = 1
  AND (
    participant."calendarEventId",
    participant."personId",
    participant."workspaceMemberId",
    participant."isOrganizer"
  ) IS DISTINCT FROM (
    merged_participant."keeperId",
    merged_participant."personId",
    merged_participant."workspaceMemberId",
    merged_participant."isOrganizer"
  )`;

const buildTargetMergeQuery = ({
  schemaName,
  targetColumnNames,
}: {
  schemaName: string;
  targetColumnNames: string[];
}): string => `WITH ${PAIR_CTE}, candidate AS (
  SELECT
    target."id",
    merged_event."keeperId",
    row_number() OVER (
      target_group ORDER BY target."calendarEventId" = merged_event."keeperId" DESC, target."createdAt", target."id"
    ) AS "rank",
    bool_or(target."isAutomaticallyAssigned") OVER target_group AS "isAutomaticallyAssigned",
    bool_or(target."isManuallyAssigned") OVER target_group AS "isManuallyAssigned"
  FROM "${schemaName}"."calendarEventTarget" target
  INNER JOIN merged_event ON merged_event."calendarEventId" = target."calendarEventId"
  WHERE target."deletedAt" IS NULL
  WINDOW target_group AS (
    PARTITION BY merged_event."keeperId"${buildExtraPartitionColumns({ alias: 'target', columnNames: targetColumnNames })}
  )
), deleted_target AS (
  DELETE FROM "${schemaName}"."calendarEventTarget"
  WHERE "id" IN (SELECT "id" FROM candidate WHERE "rank" > 1)
)
UPDATE "${schemaName}"."calendarEventTarget" target
SET
  "calendarEventId" = candidate."keeperId",
  "isAutomaticallyAssigned" = candidate."isAutomaticallyAssigned",
  "isManuallyAssigned" = candidate."isManuallyAssigned"
FROM candidate
WHERE target."id" = candidate."id"
  AND candidate."rank" = 1
  AND (
    target."calendarEventId",
    target."isAutomaticallyAssigned",
    target."isManuallyAssigned"
  ) IS DISTINCT FROM (
    candidate."keeperId",
    candidate."isAutomaticallyAssigned",
    candidate."isManuallyAssigned"
  )`;

const buildTimelineActivityMergeQuery = ({
  schemaName,
  targetColumnNames,
}: {
  schemaName: string;
  targetColumnNames: string[];
}): string => `WITH ${PAIR_CTE}, candidate AS (
  SELECT
    activity."id",
    merged_event."keeperId",
    row_number() OVER (
      PARTITION BY merged_event."keeperId", activity."timelineActivityTypeId"${buildExtraPartitionColumns({ alias: 'activity', columnNames: targetColumnNames })}
      ORDER BY activity."linkedRecordId" = merged_event."keeperId" DESC, activity."createdAt", activity."id"
    ) AS "rank"
  FROM "${schemaName}"."timelineActivity" activity
  INNER JOIN merged_event ON merged_event."calendarEventId" = activity."linkedRecordId"
  WHERE activity."linkedObjectMetadataId" = (SELECT "id" FROM calendar_event_object)
), deleted_activity AS (
  DELETE FROM "${schemaName}"."timelineActivity"
  WHERE "id" IN (SELECT "id" FROM candidate WHERE "rank" > 1)
)
UPDATE "${schemaName}"."timelineActivity" activity
SET "linkedRecordId" = candidate."keeperId"
FROM candidate
WHERE activity."id" = candidate."id"
  AND candidate."rank" = 1
  AND activity."linkedRecordId" <> candidate."keeperId"`;

const buildRecordShareMergeQuery = (schemaName: string): string => `WITH ${PAIR_CTE}, mapped_share AS (
  SELECT
    share."id",
    share."recordId",
    share."principalId",
    share."rowCause",
    share."createdAt",
    merged_event."keeperId",
    CASE WHEN share."sourceId" = share."recordId" THEN merged_event."keeperId" ELSE share."sourceId" END AS "sourceId"
  FROM "${schemaName}"."recordShare" share
  INNER JOIN merged_event ON merged_event."calendarEventId" = share."recordId"
  WHERE share."objectMetadataId" = (SELECT "id" FROM calendar_event_object)
), candidate AS (
  SELECT
    "id",
    "keeperId",
    "sourceId",
    row_number() OVER (
      PARTITION BY "keeperId", "principalId", "rowCause", "sourceId"
      ORDER BY "recordId" = "keeperId" DESC, "createdAt", "id"
    ) AS "rank"
  FROM mapped_share
), deleted_share AS (
  DELETE FROM "${schemaName}"."recordShare"
  WHERE "id" IN (SELECT "id" FROM candidate WHERE "rank" > 1)
)
UPDATE "${schemaName}"."recordShare" share
SET "recordId" = candidate."keeperId", "sourceId" = candidate."sourceId"
FROM candidate
WHERE share."id" = candidate."id"
  AND candidate."rank" = 1
  AND share."recordId" <> candidate."keeperId"`;

export const buildCalendarEventMergeQueries = ({
  schemaName,
  calendarEventTargetColumnNames,
  timelineActivityTargetColumnNames,
  hasRecordShareTable,
  otherReferencingColumns,
}: {
  schemaName: string;
  calendarEventTargetColumnNames: string[] | null;
  timelineActivityTargetColumnNames: string[] | null;
  hasRecordShareTable: boolean;
  otherReferencingColumns: ReferencingColumn[];
}): string[] => [
  `WITH ${PAIR_CTE}
SELECT 1 FROM "${schemaName}"."calendarEvent"
WHERE "id" IN (SELECT "calendarEventId" FROM merged_event)
ORDER BY "id"
FOR UPDATE`,
  buildParticipantMergeQuery(schemaName),
  buildRepointQuery({
    schemaName,
    tableName: 'calendarEventParticipant',
    columnName: 'calendarEventId',
  }),
  ...(isDefined(calendarEventTargetColumnNames)
    ? [
        buildTargetMergeQuery({
          schemaName,
          targetColumnNames: calendarEventTargetColumnNames,
        }),
        buildRepointQuery({
          schemaName,
          tableName: 'calendarEventTarget',
          columnName: 'calendarEventId',
        }),
      ]
    : []),
  ...(isDefined(timelineActivityTargetColumnNames)
    ? [
        buildTimelineActivityMergeQuery({
          schemaName,
          targetColumnNames: timelineActivityTargetColumnNames,
        }),
      ]
    : []),
  ...(hasRecordShareTable ? [buildRecordShareMergeQuery(schemaName)] : []),
  buildRepointQuery({
    schemaName,
    tableName: 'calendarChannelEventAssociation',
    columnName: 'calendarEventId',
  }),
  ...otherReferencingColumns.map(({ tableName, columnName }) =>
    buildRepointQuery({ schemaName, tableName, columnName }),
  ),
  `WITH ${PAIR_CTE}
DELETE FROM "${schemaName}"."calendarEvent" calendar_event
USING pair
WHERE calendar_event."id" = pair."duplicateId"`,
];

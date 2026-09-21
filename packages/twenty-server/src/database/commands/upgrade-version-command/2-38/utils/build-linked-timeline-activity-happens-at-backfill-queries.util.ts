import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';

type LinkedTimelineActivityHappensAtBackfillQuery = {
  label: string;
  countSql: string;
  updateSql: string;
  parameters: [string[]];
};

type LinkedSourceObject = {
  label: string;
  objectUniversalIdentifier: string;
  sourceTableName: 'message' | 'calendarEvent';
  happensAtColumnName: 'receivedAt' | 'startsAt';
};

// Linked activities were historically stamped with the participant row's own
// timestamps, so synced emails and meetings sat at import time instead of when
// they happened. The write path now uses these same source columns.
const LINKED_SOURCE_OBJECTS: LinkedSourceObject[] = [
  {
    label: 'message timeline activities',
    objectUniversalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
    sourceTableName: 'message',
    happensAtColumnName: 'receivedAt',
  },
  {
    label: 'calendar event timeline activities',
    objectUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    sourceTableName: 'calendarEvent',
    happensAtColumnName: 'startsAt',
  },
];

const buildQueryForSourceObject = ({
  schemaName,
  batchSize,
  sourceObject,
  timelineActivityTypeIds,
}: {
  schemaName: string;
  batchSize: number;
  sourceObject: LinkedSourceObject;
  timelineActivityTypeIds: string[];
}): LinkedTimelineActivityHappensAtBackfillQuery => {
  const { label, sourceTableName, happensAtColumnName } = sourceObject;

  const candidateSql = `SELECT candidate_timeline_activity."id"
FROM "${schemaName}"."timelineActivity" candidate_timeline_activity
INNER JOIN "${schemaName}"."${sourceTableName}" candidate_source
  ON candidate_source."id" = candidate_timeline_activity."linkedRecordId"
WHERE candidate_timeline_activity."timelineActivityTypeId" = ANY($1::uuid[])
  AND candidate_source."${happensAtColumnName}" IS NOT NULL
  AND candidate_timeline_activity."happensAt" IS DISTINCT FROM candidate_source."${happensAtColumnName}"`;

  return {
    label,
    countSql: `SELECT COUNT(*)::int AS "count" FROM (${candidateSql}) candidates`,
    updateSql: `UPDATE "${schemaName}"."timelineActivity" timeline_activity
SET "happensAt" = source."${happensAtColumnName}"
FROM "${schemaName}"."${sourceTableName}" source
WHERE timeline_activity."id" IN (${candidateSql}
  LIMIT ${batchSize})
  AND source."id" = timeline_activity."linkedRecordId"`,
    parameters: [timelineActivityTypeIds],
  };
};

export const buildLinkedTimelineActivityHappensAtBackfillQueries = ({
  schemaName,
  batchSize,
  flatTimelineActivityTypes,
}: {
  schemaName: string;
  batchSize: number;
  flatTimelineActivityTypes: Pick<
    FlatTimelineActivityType,
    'id' | 'action' | 'objectUniversalIdentifier'
  >[];
}): LinkedTimelineActivityHappensAtBackfillQuery[] =>
  LINKED_SOURCE_OBJECTS.flatMap((sourceObject) => {
    // Inactive types still label rows written while they were active, so they
    // stay in scope; the filter mirrors how the write path picks the type.
    const timelineActivityTypeIds = flatTimelineActivityTypes
      .filter(
        (flatTimelineActivityType) =>
          flatTimelineActivityType.action === 'linked' &&
          flatTimelineActivityType.objectUniversalIdentifier ===
            sourceObject.objectUniversalIdentifier,
      )
      .map((flatTimelineActivityType) => flatTimelineActivityType.id);

    if (timelineActivityTypeIds.length === 0) {
      return [];
    }

    return [
      buildQueryForSourceObject({
        schemaName,
        batchSize,
        sourceObject,
        timelineActivityTypeIds,
      }),
    ];
  });

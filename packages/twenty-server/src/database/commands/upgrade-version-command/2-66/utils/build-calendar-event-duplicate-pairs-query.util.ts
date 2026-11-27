import { ConnectedAccountProvider } from 'twenty-shared/types';

export const buildCalendarEventDuplicatePairsQuery = (
  schemaName: string,
): string => `WITH calendar_channel AS (
  SELECT * FROM unnest($1::uuid[], $2::text[]) AS calendar_channel("id", "provider")
), sharing_key AS (
  SELECT DISTINCT ON (calendar_event."id")
    calendar_event."id" AS "calendarEventId",
    calendar_event."createdAt",
    calendar_event."iCalUid",
    calendar_channel."provider",
    CASE calendar_channel."provider"
      WHEN '${ConnectedAccountProvider.GOOGLE}' THEN association."eventExternalId"
    END AS "eventExternalId"
  FROM "${schemaName}"."calendarChannelEventAssociation" association
  INNER JOIN "${schemaName}"."calendarEvent" calendar_event
    ON calendar_event."id" = association."calendarEventId"
  INNER JOIN calendar_channel
    ON calendar_channel."id" = association."calendarChannelId"
  WHERE association."deletedAt" IS NULL
    AND calendar_event."deletedAt" IS NULL
    AND calendar_event."iCalUid" <> ''
    AND (
      calendar_channel."provider" = '${ConnectedAccountProvider.MICROSOFT}'
      OR association."eventExternalId" <> ''
    )
  ORDER BY calendar_event."id", association."createdAt"
), sharing_group AS (
  SELECT
    "calendarEventId",
    first_value("calendarEventId") OVER sharing_window AS "keeperId",
    COUNT(*) OVER (PARTITION BY "provider", "eventExternalId", "iCalUid") AS "eventCount"
  FROM sharing_key
  WINDOW sharing_window AS (
    PARTITION BY "provider", "eventExternalId", "iCalUid"
    ORDER BY "createdAt", "calendarEventId"
  )
), group_sharing_a_channel AS (
  SELECT sharing_group."keeperId"
  FROM sharing_group
  INNER JOIN "${schemaName}"."calendarChannelEventAssociation" association
    ON association."calendarEventId" = sharing_group."calendarEventId"
  WHERE sharing_group."eventCount" > 1
  GROUP BY sharing_group."keeperId", association."calendarChannelId"
  HAVING COUNT(DISTINCT sharing_group."calendarEventId") > 1
)
SELECT sharing_group."calendarEventId" AS "duplicateId", sharing_group."keeperId"
FROM sharing_group
WHERE sharing_group."calendarEventId" <> sharing_group."keeperId"
  AND NOT EXISTS (
    SELECT 1
    FROM group_sharing_a_channel
    WHERE group_sharing_a_channel."keeperId" = sharing_group."keeperId"
  )
ORDER BY sharing_group."keeperId"`;

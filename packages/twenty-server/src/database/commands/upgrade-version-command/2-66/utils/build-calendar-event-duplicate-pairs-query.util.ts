import { ConnectedAccountProvider } from 'twenty-shared/types';

export const buildCalendarEventDuplicatePairsQuery = (
  schemaName: string,
): string => `SELECT keyed_event."calendarEventId" AS "duplicateId", keyed_event."keeperId"
FROM (
  SELECT
    sharing_key."calendarEventId",
    first_value(sharing_key."calendarEventId") OVER (
      PARTITION BY sharing_key."provider", sharing_key."eventExternalId", sharing_key."iCalUid"
      ORDER BY sharing_key."createdAt", sharing_key."calendarEventId"
    ) AS "keeperId"
  FROM (
    SELECT DISTINCT ON (calendar_event."id")
      calendar_event."id" AS "calendarEventId",
      calendar_event."createdAt",
      calendar_event."iCalUid",
      connected_account."provider",
      CASE connected_account."provider"
        WHEN '${ConnectedAccountProvider.GOOGLE}' THEN association."eventExternalId"
      END AS "eventExternalId"
    FROM "${schemaName}"."calendarChannelEventAssociation" association
    INNER JOIN "${schemaName}"."calendarEvent" calendar_event
      ON calendar_event."id" = association."calendarEventId"
    INNER JOIN core."calendarChannel" calendar_channel
      ON calendar_channel."id" = association."calendarChannelId"
    INNER JOIN core."connectedAccount" connected_account
      ON connected_account."id" = calendar_channel."connectedAccountId"
    WHERE calendar_channel."workspaceId" = $1
      AND connected_account."provider" IN ('${ConnectedAccountProvider.GOOGLE}', '${ConnectedAccountProvider.MICROSOFT}')
      AND association."deletedAt" IS NULL
      AND calendar_event."deletedAt" IS NULL
      AND calendar_event."iCalUid" <> ''
      AND (
        connected_account."provider" = '${ConnectedAccountProvider.MICROSOFT}'
        OR association."eventExternalId" <> ''
      )
    ORDER BY calendar_event."id", association."createdAt"
  ) sharing_key
) keyed_event
WHERE keyed_event."calendarEventId" <> keyed_event."keeperId"
ORDER BY keyed_event."keeperId"`;

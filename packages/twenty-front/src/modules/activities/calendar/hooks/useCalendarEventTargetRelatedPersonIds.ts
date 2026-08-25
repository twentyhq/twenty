import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type GetTimelineCalendarEventsFromObjectRecordQuery,
  type GetTimelineCalendarEventsFromObjectRecordQueryVariables,
} from '~/generated/graphql';

export const useCalendarEventTargetRelatedPersonIds = (
  contextRecord: EmailComposerContextRecord | undefined,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery<
    GetTimelineCalendarEventsFromObjectRecordQuery,
    GetTimelineCalendarEventsFromObjectRecordQueryVariables
  >(getTimelineCalendarEventsFromObjectRecord, {
    client: apolloCoreClient,
    skip: !isDefined(contextRecord),
    variables: {
      objectNameSingular: contextRecord?.objectNameSingular ?? '',
      recordId: contextRecord?.recordId ?? '',
      page: 1,
      pageSize: TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
    },
  });

  return data?.getTimelineCalendarEventsFromObjectRecord.relatedPersonIds ?? [];
};

import { useEffect } from 'react';

import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { CalendarEventDetailsEffect } from '@/activities/calendar/components/CalendarEventDetailsEffect';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const SidePanelCalendarEventPage = () => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const viewableRecordId = useAtomComponentStateValue(
    viewableRecordIdComponentState,
  );

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    depth: 1,
  });

  const calendarEventRecordGqlFields = {
    ...recordGqlFields,
    calendarEventParticipants: {
      id: true,
      person: true,
      workspaceMember: true,
      isOrganizer: true,
      responseStatus: true,
      handle: true,
      createdAt: true,
      calendarEventId: true,
      updatedAt: true,
      displayName: true,
    },
  };

  const { record: calendarEvent } = useFindOneRecord<CalendarEvent>({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    objectRecordId: viewableRecordId ?? '',
    recordGqlFields: calendarEventRecordGqlFields,
  });

  useEffect(() => {
    if (calendarEvent) {
      upsertRecordsInStore({ partialRecords: [calendarEvent] });
    }
  }, [calendarEvent, upsertRecordsInStore]);

  if (!calendarEvent) {
    return null;
  }

  return (
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: {
          id: calendarEvent.id,
          targetObjectNameSingular: CoreObjectNameSingular.CalendarEvent,
        },
        layoutType: PageLayoutType.RECORD_PAGE,
        isInSidePanel: true,
      }}
    >
      <CalendarEventDetailsEffect record={calendarEvent} />
      <CalendarEventDetails calendarEvent={calendarEvent} />
    </LayoutRenderingProvider>
  );
};

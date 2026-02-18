import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { CalendarEventDetailsEffect } from '@/activities/calendar/components/CalendarEventDetailsEffect';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const CommandMenuCalendarEventPage = () => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const viewableRecordId = useRecoilComponentValue(
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
    // TODO: this is not executed on sub-sequent runs, make sure that it is intended
    onCompleted: (record) => {
      upsertRecordsInStore({ partialRecords: [record] });
    },
  });

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
        isInRightDrawer: true,
      }}
    >
      <CalendarEventDetailsEffect record={calendarEvent} />
      <CalendarEventDetails calendarEvent={calendarEvent} />
    </LayoutRenderingProvider>
  );
};

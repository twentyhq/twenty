import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useCalendarEventTargetRecordId } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventTargetRecordId';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import {
  AppPath,
  CoreObjectNameSingular,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

export const useCallRecordingsSeeAllHref = (): string | undefined => {
  const calendarEventId = useCalendarEventTargetRecordId();

  const callRecordingObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: CoreObjectNameSingular.CallRecording,
      objectNameType: 'singular',
    },
  );

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: callRecordingObjectMetadataItem?.id ?? '' },
  );

  if (
    !isDefined(calendarEventId) ||
    !isDefined(callRecordingObjectMetadataItem)
  ) {
    return undefined;
  }

  return getAppPath(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: callRecordingObjectMetadataItem.namePlural,
    },
    {
      filter: {
        calendarEvent: {
          [ViewFilterOperand.IS]: {
            selectedRecordIds: [calendarEventId],
          },
        },
      },
      viewId: indexViewId,
    },
  );
};

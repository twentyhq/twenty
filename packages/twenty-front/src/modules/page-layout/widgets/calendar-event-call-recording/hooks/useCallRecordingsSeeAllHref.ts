import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';
import {
  AppPath,
  CoreObjectNameSingular,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

export const useCallRecordingsSeeAllHref = (): string | undefined => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const calendarEventId =
    targetRecordIdentifier?.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent
      ? targetRecordIdentifier.id
      : undefined;

  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const indexViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: callRecordingObjectMetadataItem.id },
  );

  if (!isDefined(calendarEventId)) {
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

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

export const useOpenCalendarEventInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openCalendarEventInSidePanel = useCallback(
    (calendarEventId: string) => {
      const pageComponentInstanceId = v4();

      store.set(
        viewableRecordIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        calendarEventId,
      );

      // TODO: Uncomment this once we need to calendar event title in the navigation
      // const objectMetadataItem = snapshot
      //   .getLoadable(objectMetadataItemsSelector)
      //   .getValue()
      //   .find(
      //     ({ nameSingular }) =>
      //       nameSingular === CoreObjectNameSingular.CalendarEvent,
      //   );

      // set(
      //   commandMenuNavigationMorphItemsState,
      //   new Map([
      //     ...snapshot
      //       .getLoadable(commandMenuNavigationMorphItemsState)
      //       .getValue(),
      //     [
      //       pageComponentInstanceId,
      //       {
      //         objectMetadataId: objectMetadataItem?.id,
      //         recordId: calendarEventId,
      //       },
      //     ],
      //   ]),
      // );

      navigateSidePanel({
        page: SidePanelPages.ViewCalendarEvent,
        pageTitle: t`Calendar Event`,
        pageIcon: IconCalendarEvent,
        pageId: pageComponentInstanceId,
      });
    },
    [navigateSidePanel, store],
  );

  return {
    openCalendarEventInSidePanel,
  };
};

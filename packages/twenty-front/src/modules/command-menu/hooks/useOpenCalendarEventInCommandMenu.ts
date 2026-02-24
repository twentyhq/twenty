import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenCalendarEventInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openCalendarEventInCommandMenu = useCallback(
    (calendarEventId: string) => {
      const pageComponentInstanceId = v4();

      jotaiStore.set(
        viewableRecordIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        calendarEventId,
      );

      // TODO: Uncomment this once we need to calendar event title in the navigation
      // const objectMetadataItem = snapshot
      //   .getLoadable(objectMetadataItemsState)
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

      navigateCommandMenu({
        page: CommandMenuPages.ViewCalendarEvent,
        pageTitle: t`Calendar Event`,
        pageIcon: IconCalendarEvent,
        pageId: pageComponentInstanceId,
      });
    },
    [navigateCommandMenu],
  );

  return {
    openCalendarEventInCommandMenu,
  };
};

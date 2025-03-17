import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { IconCalendarEvent, IconDotsVertical, IconMail } from 'twenty-ui';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
  const { navigateCommandMenu, onCommandMenuCloseAnimationComplete } =
    useNavigateCommandMenu();

  const closeCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuOpenedState, false);
        set(isCommandMenuClosingState, true);
        set(isDragSelectionStartEnabledState, true);
      },
    [],
  );

  const openCommandMenu = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
  }, [navigateCommandMenu]);

  const toggleCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        set(commandMenuSearchState, '');

        if (isCommandMenuOpened) {
          closeCommandMenu();
        } else {
          openCommandMenu();
        }
      },
    [closeCommandMenu, openCommandMenu],
  );

  const openCalendarEventInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (calendarEventId: string) => {
        const pageComponentInstanceId = v4();

        set(
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
          pageTitle: 'Calendar Event',
          pageIcon: IconCalendarEvent,
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openEmailThreadInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (emailThreadId: string) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          emailThreadId,
        );

        // TODO: Uncomment this once we need to show the thread title in the navigation
        // const objectMetadataItem = snapshot
        //   .getLoadable(objectMetadataItemsState)
        //   .getValue()
        //   .find(
        //     ({ nameSingular }) =>
        //       nameSingular === CoreObjectNameSingular.MessageThread,
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
        //         recordId: emailThreadId,
        //       },
        //     ],
        //   ]),
        // );

        navigateCommandMenu({
          page: CommandMenuPages.ViewEmailThread,
          pageTitle: 'Email Thread',
          pageIcon: IconMail,
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openCommandMenu,
    closeCommandMenu,
    onCommandMenuCloseAnimationComplete,
    navigateCommandMenu,
    toggleCommandMenu,
    openCalendarEventInCommandMenu,
    openEmailThreadInCommandMenu,
  };
};

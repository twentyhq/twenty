import { useRecoilCallback, useRecoilValue } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { IconDotsVertical, IconSearch, useIcons } from 'twenty-ui';

import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import {
  CommandMenuNavigationStackItem,
  commandMenuNavigationStackState,
} from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { capitalize, isDefined } from 'twenty-shared';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
  const { resetSelectedItem } = useSelectableList('command-menu-list');
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { getIcon } = useIcons();

  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { resetContextStoreStates } = useResetContextStoreStates();

  const openCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          return;
        }

        copyContextStoreStates({
          instanceIdToCopyFrom: mainContextStoreComponentInstanceId,
          instanceIdToCopyTo: 'command-menu',
        });

        set(isCommandMenuOpenedState, true);
        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
        set(hasUserSelectedCommandState, false);
      },
    [
      copyContextStoreStates,
      mainContextStoreComponentInstanceId,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  const closeCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuOpenedState, false);
      },
    [],
  );

  const onCommandMenuCloseAnimationComplete = useRecoilCallback(
    ({ set }) =>
      () => {
        resetContextStoreStates('command-menu');
        resetContextStoreStates('command-menu-previous');

        set(viewableRecordIdState, null);
        set(commandMenuPageState, CommandMenuPages.Root);
        set(commandMenuPageInfoState, {
          title: undefined,
          Icon: undefined,
        });
        set(isCommandMenuOpenedState, false);
        set(commandMenuSearchState, '');
        set(commandMenuNavigationStackState, []);
        resetSelectedItem();
        set(hasUserSelectedCommandState, false);
        goBackToPreviousHotkeyScope();

        emitRightDrawerCloseEvent();
      },
    [goBackToPreviousHotkeyScope, resetContextStoreStates, resetSelectedItem],
  );

  const navigateCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return ({
        page,
        pageTitle,
        pageIcon,
        resetNavigationStack = false,
      }: CommandMenuNavigationStackItem & {
        resetNavigationStack?: boolean;
      }) => {
        set(commandMenuPageState, page);
        set(commandMenuPageInfoState, {
          title: pageTitle,
          Icon: pageIcon,
        });

        const currentNavigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        if (resetNavigationStack) {
          set(commandMenuNavigationStackState, [{ page, pageTitle, pageIcon }]);
        } else {
          set(commandMenuNavigationStackState, [
            ...currentNavigationStack,
            { page, pageTitle, pageIcon },
          ]);
        }
        openCommandMenu();
      };
    },
    [openCommandMenu],
  );

  const openRootCommandMenu = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
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
          openRootCommandMenu();
        }
      },
    [closeCommandMenu, openRootCommandMenu],
  );

  const goBackFromCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return () => {
        const currentNavigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const newNavigationStack = currentNavigationStack.slice(0, -1);
        const lastNavigationStackItem = newNavigationStack.at(-1);

        if (!isDefined(lastNavigationStackItem)) {
          closeCommandMenu();
          return;
        }

        set(commandMenuPageState, lastNavigationStackItem.page);

        set(commandMenuPageInfoState, {
          title: lastNavigationStackItem.pageTitle,
          Icon: lastNavigationStackItem.pageIcon,
        });

        set(commandMenuNavigationStackState, newNavigationStack);
        set(hasUserSelectedCommandState, false);
      };
    },
    [closeCommandMenu],
  );

  const navigateCommandMenuHistory = useRecoilCallback(({ snapshot, set }) => {
    return (pageIndex: number) => {
      const currentNavigationStack = snapshot
        .getLoadable(commandMenuNavigationStackState)
        .getValue();

      const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);

      set(commandMenuNavigationStackState, newNavigationStack);

      const newNavigationStackItem = newNavigationStack.at(-1);

      if (!isDefined(newNavigationStackItem)) {
        throw new Error(
          `No command menu navigation stack item found for index ${pageIndex}`,
        );
      }

      set(commandMenuPageState, newNavigationStackItem?.page);
      set(commandMenuPageInfoState, {
        title: newNavigationStackItem?.pageTitle,
        Icon: newNavigationStackItem?.pageIcon,
      });

      set(hasUserSelectedCommandState, false);
    };
  }, []);

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set, snapshot }) => {
      return ({
        recordId,
        objectNameSingular,
        isNewRecord = false,
      }: {
        recordId: string;
        objectNameSingular: string;
        isNewRecord?: boolean;
      }) => {
        set(viewableRecordNameSingularState, objectNameSingular);
        set(viewableRecordIdState, recordId);

        const objectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: objectNameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        const Icon = objectMetadataItem?.icon
          ? getIcon(objectMetadataItem.icon)
          : getIcon('IconList');

        const capitalizedObjectNameSingular = capitalize(objectNameSingular);

        navigateCommandMenu({
          page: CommandMenuPages.ViewRecord,
          pageTitle: isNewRecord
            ? t`New ${capitalizedObjectNameSingular}`
            : capitalizedObjectNameSingular,
          pageIcon: Icon,
          resetNavigationStack: true,
        });
      };
    },
    [getIcon, navigateCommandMenu],
  );

  const openRecordsSearchPage = () => {
    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconSearch,
    });
  };

  const setGlobalCommandMenuContext = useRecoilCallback(
    ({ set }) => {
      return () => {
        copyContextStoreStates({
          instanceIdToCopyFrom: 'command-menu',
          instanceIdToCopyTo: 'command-menu-previous',
        });

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: 'command-menu',
          }),
          {
            mode: 'selection',
            selectedRecordIds: [],
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: 'command-menu',
          }),
          0,
        );

        set(
          contextStoreFiltersComponentState.atomFamily({
            instanceId: 'command-menu',
          }),
          [],
        );

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: 'command-menu',
          }),
          ContextStoreViewType.Table,
        );

        set(commandMenuPageInfoState, {
          title: undefined,
          Icon: undefined,
        });

        set(hasUserSelectedCommandState, false);
      };
    },
    [copyContextStoreStates],
  );

  return {
    openRootCommandMenu,
    closeCommandMenu,
    onCommandMenuCloseAnimationComplete,
    navigateCommandMenu,
    navigateCommandMenuHistory,
    goBackFromCommandMenu,
    openRecordsSearchPage,
    openRecordInCommandMenu,
    toggleCommandMenu,
    setGlobalCommandMenuContext,
  };
};

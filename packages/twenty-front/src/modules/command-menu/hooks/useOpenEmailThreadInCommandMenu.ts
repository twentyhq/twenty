import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenEmailThreadInCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openEmailThreadInCommandMenu = useCallback(
    (emailThreadId: string) => {
      const pageComponentInstanceId = v4();

      jotaiStore.set(
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
        pageTitle: t`Email Thread`,
        pageIcon: IconMail,
        pageId: pageComponentInstanceId,
      });
    },
    [navigateCommandMenu],
  );

  return {
    openEmailThreadInCommandMenu,
  };
};

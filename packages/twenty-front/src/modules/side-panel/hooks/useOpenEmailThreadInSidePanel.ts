import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

export const useOpenEmailThreadInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openEmailThreadInSidePanel = useCallback(
    (emailThreadId: string) => {
      const pageComponentInstanceId = v4();

      store.set(
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

      navigateSidePanel({
        page: SidePanelPages.ViewEmailThread,
        pageTitle: t`Email Thread`,
        pageIcon: IconMail,
        pageId: pageComponentInstanceId,
      });
    },
    [navigateSidePanel, store],
  );

  return {
    openEmailThreadInSidePanel,
  };
};

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelSearchContextObjectNameSingularState } from '@/side-panel/states/sidePanelSearchContextObjectNameSingularState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordsSearchPageInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const setContextObjectNameSingular = useSetAtomState(
    sidePanelSearchContextObjectNameSingularState,
  );

  const openRecordsSearchPage = () => {
    const currentObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === contextStoreCurrentObjectMetadataItemId,
    );
    setContextObjectNameSingular(
      currentObjectMetadataItem?.nameSingular ?? null,
    );

    navigateSidePanelMenu({
      page: SidePanelPages.SearchRecords,
      pageTitle: t`Search`,
      pageIcon: IconSearch,
      pageId: v4(),
      resetNavigationStack: isSidePanelOpened,
    });
  };

  return {
    openRecordsSearchPage,
  };
};

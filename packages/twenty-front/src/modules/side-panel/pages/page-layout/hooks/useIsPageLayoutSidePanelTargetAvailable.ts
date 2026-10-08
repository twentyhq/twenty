import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getPageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/utils/getPageLayoutSidePanelTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

// The side panel keeps its navigation stack, and so its page layout pages,
// mounted while it animates closed, after leaving the page has already reset
// the main context store selection
export const useIsPageLayoutSidePanelTargetAvailable = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  return isDefined(
    getPageLayoutSidePanelTarget({
      contextStoreCurrentObjectMetadataItemId,
      contextStoreTargetedRecordsRule,
    }),
  );
};

import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type BrowsingContext } from '@/ai/types/BrowsingContext';
import { getAiChatBrowsingContextType } from '@/ai/utils/getAiChatBrowsingContextType';
import { getAiChatContextStoreInstanceId } from '@/ai/utils/getAiChatContextStoreInstanceId';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useStore } from 'jotai';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useGetBrowsingContext = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  const getBrowsingContext = useCallback((): BrowsingContext | null => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);
    const currentSidePanelPage = store
      .get(sidePanelNavigationStackState.atom)
      .at(-1);

    const instanceId = getAiChatContextStoreInstanceId({
      isOnAiChatPage: isCurrentPathAiChatPage(),
      isSidePanelOpened,
      currentSidePanelPageId: currentSidePanelPage?.pageId,
    });

    const pageType = store.get(
      contextStoreCurrentPageTypeComponentState.atomFamily({
        instanceId,
        surfaceId,
      }),
    );

    const viewType = store.get(
      contextStoreCurrentViewTypeComponentState.atomFamily({
        instanceId,
        surfaceId,
      }),
    );

    const objectMetadataItemId = store.get(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId,
        surfaceId,
      }),
    );

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === objectMetadataItemId,
    );

    if (!objectMetadataItem) {
      return null;
    }

    const browsingContextType = getAiChatBrowsingContextType({
      pageType,
      viewType,
    });

    if (browsingContextType === 'recordPage') {
      const targetedRecordsRule = store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
      );

      if (
        targetedRecordsRule.mode !== 'selection' ||
        targetedRecordsRule.selectedRecordIds.length !== 1
      ) {
        return null;
      }

      const recordContext: BrowsingContext = {
        type: 'recordPage',
        objectNameSingular: objectMetadataItem.nameSingular,
        recordId: targetedRecordsRule.selectedRecordIds[0],
      };

      const pageLayoutId = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId: targetedRecordsRule.selectedRecordIds[0],
          fieldName: 'pageLayoutId',
        }),
      ) as string | null | undefined;

      if (isDefined(pageLayoutId)) {
        const tabListInstanceId =
          getTabListInstanceIdFromPageLayoutId(pageLayoutId);
        const activeTabId = store.get(
          activeTabIdComponentState.atomFamily({
            instanceId: tabListInstanceId,
            surfaceId,
          }),
        );

        return {
          ...recordContext,
          pageLayoutId,
          activeTabId,
        };
      }

      return recordContext;
    }

    if (browsingContextType === 'listView') {
      const currentViewId = store.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
      );

      const currentView = store.get(
        viewFromViewIdFamilySelector.selectorFamily({
          viewId: currentViewId ?? '',
        }),
      );

      if (!currentView) {
        return null;
      }

      const contextStoreFilters = store.get(
        contextStoreFiltersComponentState.atomFamily({
          instanceId,
          surfaceId,
        }),
      );

      const filterDescriptions = contextStoreFilters.map(
        (filter: {
          fieldMetadataId: string;
          operand: string;
          displayValue: string;
        }) => {
          const fieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.id === filter.fieldMetadataId,
          );
          const fieldLabel = fieldMetadataItem?.label ?? t`Unknown field`;

          return `${fieldLabel} ${filter.operand} "${filter.displayValue}"`;
        },
      );

      return {
        type: 'listView',
        objectNameSingular: objectMetadataItem.nameSingular,
        viewId: currentView.id,
        viewName: currentView.name,
        filterDescriptions,
      };
    }

    return null;
  }, [store, surfaceId]);

  return { getBrowsingContext };
};

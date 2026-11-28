import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type BrowsingContext } from '@/ai-chat/types/BrowsingContext';
import { settingsExpressionDraftState } from '@/ai-chat/states/settingsExpressionDraftState';
import { buildSettingsPageBrowsingContext } from '@/ai-chat/utils/buildSettingsPageBrowsingContext';
import { getAiChatBrowsingContextType } from '@/ai-chat/utils/getAiChatBrowsingContextType';
import { getAiChatContextStoreInstanceId } from '@/ai-chat/utils/getAiChatContextStoreInstanceId';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
import { isSettingsPath } from '~/utils/isSettingsPath';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useStore } from 'jotai';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useGetBrowsingContext = () => {
  const store = useStore();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  const getBrowsingContext = useCallback((): BrowsingContext | null => {
    const { pathname } = window.location;

    if (isSettingsPath(pathname)) {
      return buildSettingsPageBrowsingContext({
        path: pathname,
        draft: store.get(settingsExpressionDraftState.atom),
        isDraftEnabled: isCustomizableSidebarEnabled,
      });
    }

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
      }),
    );

    const viewType = store.get(
      contextStoreCurrentViewTypeComponentState.atomFamily({
        instanceId,
      }),
    );

    const objectMetadataItemId = store.get(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId,
      }),
    );

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === objectMetadataItemId,
    );

    if (
      !objectMetadataItem ||
      objectMetadataItem.nameSingular ===
        store.get(inboxNamesByLegacyNameSelector.atom).agentChatThread
    ) {
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
  }, [store, isCustomizableSidebarEnabled]);

  return { getBrowsingContext };
};

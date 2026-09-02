import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { type PageLayoutSidePanelContext } from '@/side-panel/pages/page-layout/types/PageLayoutSidePanelContext';
import { getPageLayoutIdFromContext } from '@/side-panel/pages/page-layout/utils/getPageLayoutIdFromContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import type { Store } from 'jotai/vanilla/store';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getPageLayoutSidePanelContext = ({
  store,
  sidePanelPageInstanceId,
}: {
  store: Store;
  sidePanelPageInstanceId?: string;
}): PageLayoutSidePanelContext | undefined => {
  if (isDefined(sidePanelPageInstanceId)) {
    const currentNavigationItem = store
      .get(sidePanelNavigationStackState.atom)
      .findLast(({ pageId }) => pageId === sidePanelPageInstanceId);

    if (isDefined(currentNavigationItem?.pageLayoutContext)) {
      return currentNavigationItem.pageLayoutContext;
    }
  }

  const objectMetadataItemId = store.get(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );
  const targetedRecordsRule = store.get(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  if (
    !isDefined(objectMetadataItemId) ||
    targetedRecordsRule.mode !== 'selection' ||
    targetedRecordsRule.selectedRecordIds.length !== 1
  ) {
    return undefined;
  }

  const objectMetadataItem = store
    .get(objectMetadataItemsSelector.atom)
    .find(({ id }) => id === objectMetadataItemId);

  if (!isDefined(objectMetadataItem)) {
    return undefined;
  }

  const recordId = targetedRecordsRule.selectedRecordIds[0];
  const isDashboardContext =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard;
  const recordPageLayoutId = isDashboardContext
    ? undefined
    : store.get(
        recordPageLayoutByObjectMetadataIdFamilySelector.selectorFamily({
          objectMetadataId: objectMetadataItemId,
        }),
      )?.id;

  const pageLayoutId = getPageLayoutIdFromContext({
    isDashboardContext,
    dashboardPageLayoutId: store.get(
      recordStoreFamilyState.atomFamily(recordId),
    )?.pageLayoutId,
    currentPageLayoutId: store.get(currentPageLayoutIdState.atom),
    recordPageLayoutId,
  });

  return {
    pageLayoutId,
    recordId,
    objectMetadataItemId,
    objectNameSingular: objectMetadataItem.nameSingular,
  };
};

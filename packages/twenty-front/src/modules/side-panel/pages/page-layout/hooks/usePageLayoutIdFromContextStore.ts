import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getPageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/utils/getPageLayoutSidePanelTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutIdFromContextStore = () => {
  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const pageLayoutSidePanelTarget = getPageLayoutSidePanelTarget({
    contextStoreCurrentObjectMetadataItemId,
    contextStoreTargetedRecordsRule,
  });

  if (!isDefined(pageLayoutSidePanelTarget)) {
    throw new Error(
      'Page layout side panel requires one selected record of a known object',
    );
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: pageLayoutSidePanelTarget.objectMetadataItemId,
  });

  const { recordId } = pageLayoutSidePanelTarget;

  const isDashboardContext =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Dashboard;

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

  const recordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  const pageLayoutId = isDashboardContext
    ? (recordStore?.pageLayoutId ?? currentPageLayoutId)
    : isDefined(recordPageLayout)
      ? recordPageLayout.id
      : null;

  return {
    pageLayoutId,
    recordId,
    objectNameSingular: objectMetadataItem.nameSingular,
  };
};

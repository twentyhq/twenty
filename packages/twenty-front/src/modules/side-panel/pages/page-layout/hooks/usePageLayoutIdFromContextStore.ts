import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getPageLayoutIdFromContext } from '@/side-panel/pages/page-layout/utils/getPageLayoutIdFromContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutIdFromContextStore = () => {
  const workspaceSurface = useWorkspaceSurface();

  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  const pageLayoutContext =
    workspaceSurface.type === 'side-panel'
      ? sidePanelNavigationStack.at(-1)?.pageLayoutContext
      : undefined;

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItemId =
    pageLayoutContext?.objectMetadataItemId ??
    contextStoreCurrentObjectMetadataItemId;

  if (!isDefined(objectMetadataItemId)) {
    throw new Error('Object metadata ID is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  if (
    !isDefined(pageLayoutContext) &&
    !(
      contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 1
    )
  ) {
    throw new Error('Only one record should be selected');
  }

  const recordId =
    pageLayoutContext?.recordId ??
    (contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined);

  if (!isDefined(recordId)) {
    throw new Error('Only one record should be selected');
  }

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

  const recordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  const pageLayoutId = isDefined(pageLayoutContext)
    ? pageLayoutContext.pageLayoutId
    : getPageLayoutIdFromContext({
        objectNameSingular: objectMetadataItem.nameSingular,
        dashboardPageLayoutId: recordStore?.pageLayoutId,
        currentPageLayoutId,
        recordPageLayoutId: recordPageLayout?.id,
      });

  if (!isDefined(pageLayoutId)) {
    throw new Error('Page layout ID is not defined');
  }

  return {
    pageLayoutId,
    recordId,
    objectMetadataItemId,
    objectNameSingular:
      pageLayoutContext?.objectNameSingular ?? objectMetadataItem.nameSingular,
  };
};

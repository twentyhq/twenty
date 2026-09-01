import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordShowPagePaginationCommandContext = () => {
  const {
    contextStoreInstanceId,
    isInSidePanel,
    objectMetadataItem,
    selectedRecords,
  } = useHeadlessCommandContextApi();

  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  const activeSidePanelPageInstanceId = sidePanelNavigationStack.at(-1)?.pageId;

  const parentViewContextStoreInstanceId =
    isInSidePanel && isDefined(activeSidePanelPageInstanceId)
      ? activeSidePanelPageInstanceId
      : contextStoreInstanceId;

  const parentView = useAtomComponentStateValue(
    contextStoreRecordShowParentViewComponentState,
    parentViewContextStoreInstanceId,
  );

  const recordId = selectedRecords[0]?.id;
  const objectNameSingular =
    parentView?.parentViewObjectNameSingular ??
    objectMetadataItem?.nameSingular;

  if (!isDefined(recordId) || !isDefined(objectNameSingular)) {
    throw new Error(
      'Record ID and object name are required to navigate between records',
    );
  }

  return { objectNameSingular, recordId };
};

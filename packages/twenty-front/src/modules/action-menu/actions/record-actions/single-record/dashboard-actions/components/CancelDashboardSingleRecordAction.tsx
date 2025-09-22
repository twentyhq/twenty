import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSetIsDashboardInEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback, useRecoilValue } from 'recoil';

export const CancelDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { setIsDashboardInEditMode } =
    useSetIsDashboardInEditMode(pageLayoutId);

  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutId,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    componentInstanceId,
  );

  const pageLayoutPersistedState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    componentInstanceId,
  );

  const resetDraftToSaved = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const pageLayoutPersisted = snapshot
          .getLoadable(pageLayoutPersistedState)
          .getValue();

        if (pageLayoutPersisted !== undefined) {
          set(pageLayoutDraftState, {
            id: pageLayoutPersisted.id,
            name: pageLayoutPersisted.name,
            type: pageLayoutPersisted.type,
            objectMetadataId: pageLayoutPersisted.objectMetadataId,
            tabs: pageLayoutPersisted.tabs,
          });
        }
      },
    [pageLayoutDraftState, pageLayoutPersistedState],
  );

  const handleClick = () => {
    resetDraftToSaved();
    setIsDashboardInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};

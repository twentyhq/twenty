import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useClearDraftPageLayoutFromLocalStorage } from '@/page-layout/hooks/useClearDraftPageLayoutFromLocalStorage';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useRecoilValue } from 'recoil';

export const CancelDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  const { clearDraftPageLayoutFromLocalStorage } =
    useClearDraftPageLayoutFromLocalStorage(pageLayoutId);

  const handleClick = () => {
    resetDraftPageLayoutToPersistedPageLayout();
    clearDraftPageLayoutFromLocalStorage();
    setIsPageLayoutInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};

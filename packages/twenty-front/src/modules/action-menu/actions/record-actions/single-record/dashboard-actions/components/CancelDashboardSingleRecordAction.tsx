import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useRecoilValue } from 'recoil';

export const CancelDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { closeCommandMenu } = useCommandMenu();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  const handleClick = () => {
    closeCommandMenu();

    resetDraftPageLayoutToPersistedPageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};

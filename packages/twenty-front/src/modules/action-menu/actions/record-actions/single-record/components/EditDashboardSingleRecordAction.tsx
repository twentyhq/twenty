import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilValue } from 'recoil';

export const EditDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const [isPageLayoutInEditMode, setIsPageLayoutInEditMode] =
    useRecoilComponentState(isPageLayoutInEditModeComponentState, pageLayoutId);

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
  };

  return isPageLayoutInEditMode ? null : <Action onClick={handleClick} />;
};

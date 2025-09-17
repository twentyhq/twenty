import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSetDashboardEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';

export const EditDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { setDashboardEditMode } = useSetDashboardEditMode(pageLayoutId);

  const handleClick = () => {
    setDashboardEditMode(true);
  };

  return <Action onClick={handleClick} />;
};

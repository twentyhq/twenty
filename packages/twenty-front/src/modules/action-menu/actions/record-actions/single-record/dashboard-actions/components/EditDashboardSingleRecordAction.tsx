import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSetIsDashboardInEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';

export const EditDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { setIsDashboardInEditMode } =
    useSetIsDashboardInEditMode(pageLayoutId);

  const handleClick = () => {
    setIsDashboardInEditMode(true);
  };

  return <Action onClick={handleClick} />;
};

import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useSetIsDashboardInEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useRecoilValue } from 'recoil';

export const SaveDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsDashboardInEditMode } =
    useSetIsDashboardInEditMode(pageLayoutId);

  const handleClick = async () => {
    await savePageLayout();
    setIsDashboardInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};

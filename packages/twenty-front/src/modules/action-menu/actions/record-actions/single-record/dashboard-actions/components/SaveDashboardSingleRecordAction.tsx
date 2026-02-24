import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';

export const SaveDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useFamilyRecoilValueV2(
    recordStoreFamilyState,
    recordId,
  );

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeCommandMenu } = useCommandMenu();

  const handleClick = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      closeCommandMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <Action onClick={handleClick} />;
};

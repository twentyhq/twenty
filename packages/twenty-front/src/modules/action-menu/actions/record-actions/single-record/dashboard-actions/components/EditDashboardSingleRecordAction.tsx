import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditDashboardSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useFamilyAtomValue(recordStoreFamilyState, recordId);

  const pageLayoutId = selectedRecord?.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <Action onClick={handleClick} />;
};

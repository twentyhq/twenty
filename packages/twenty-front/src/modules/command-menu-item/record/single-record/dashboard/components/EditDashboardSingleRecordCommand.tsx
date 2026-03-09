import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditDashboardSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const pageLayoutId = recordStore?.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <Command onClick={handleClick} />;
};

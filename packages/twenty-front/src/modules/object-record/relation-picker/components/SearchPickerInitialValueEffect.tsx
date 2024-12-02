import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const SearchPickerInitialValueEffect = ({
  initialValueForSearchFilter,
  recordPickerInstanceId,
}: {
  initialValueForSearchFilter?: string | null;
  recordPickerInstanceId: string;
}) => {
  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    recordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  useEffect(() => {
    setRecordPickerSearchFilter(initialValueForSearchFilter ?? '');
  }, [initialValueForSearchFilter, setRecordPickerSearchFilter]);

  return <></>;
};

import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

// Todo: this effect should be deprecated to use sync hooks
export const RelationPickerInitialValueEffect = ({
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

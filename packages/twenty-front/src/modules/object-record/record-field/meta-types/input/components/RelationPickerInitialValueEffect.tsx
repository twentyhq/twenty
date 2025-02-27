import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
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
    singleRecordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  useEffect(() => {
    setRecordPickerSearchFilter(initialValueForSearchFilter ?? '');
  }, [initialValueForSearchFilter, setRecordPickerSearchFilter]);

  return <></>;
};

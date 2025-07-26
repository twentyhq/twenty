import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useRecordFieldInput = <FieldValue>() => {
  const setDraftValue = useSetRecoilComponentStateV2(
    recordFieldInputDraftValueComponentState,
  );

  const isDraftValueEmpty = (
    value: FieldInputDraftValue<FieldValue> | undefined,
  ) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' && value === '') {
      return true;
    }

    return false;
  };

  return {
    setDraftValue,
    isDraftValueEmpty,
  };
};

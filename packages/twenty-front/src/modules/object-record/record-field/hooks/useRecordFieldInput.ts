import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const useRecordFieldInput = <FieldValue>() => {
  const setDraftValue = useSetRecoilComponentState(
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

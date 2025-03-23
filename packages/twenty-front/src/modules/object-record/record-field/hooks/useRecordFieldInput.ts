import { useSetRecoilState } from 'recoil';

import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';

export const useRecordFieldInput = <FieldValue>() => {
  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const getDraftValueSelector = extractComponentSelector<
    FieldInputDraftValue<FieldValue> | undefined
  >(
    recordFieldInputDraftValueComponentSelector,
    recordFieldComponentInstanceId,
  );

  const setDraftValue = useSetRecoilState(getDraftValueSelector());

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
    getDraftValueSelector,
    isDraftValueEmpty,
  };
};

import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const recordFieldInputDraftValueStateScopeMap = createStateScopeMap<
  FieldInputDraftValue | undefined
>({
  key: 'recordFieldInputDraftValueStateScopeMap',
  defaultValue: undefined,
});

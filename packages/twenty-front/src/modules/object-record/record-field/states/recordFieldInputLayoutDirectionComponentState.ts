import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputLayoutDirection } from '@/object-record/record-field/types/FieldInputLayoutDirection';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldInputLayoutDirectionComponentState =
  createComponentState<FieldInputLayoutDirection>({
    key: 'recordFieldInputLayoutDirectionComponentState',
    defaultValue: 'upward',
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

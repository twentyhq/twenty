import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldInputLayoutDirection } from '@/object-record/record-field/ui/types/FieldInputLayoutDirection';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldInputLayoutDirectionComponentState =
  createComponentState<FieldInputLayoutDirection>({
    key: 'recordFieldInputLayoutDirectionComponentState',
    defaultValue: 'upward',
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

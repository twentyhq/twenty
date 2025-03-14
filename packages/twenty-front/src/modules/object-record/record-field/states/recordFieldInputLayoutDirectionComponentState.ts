import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldInputLayoutDirection } from '@/object-record/record-field/types/FieldInputLayoutDirection';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordFieldInputLayoutDirectionComponentState =
  createComponentStateV2<FieldInputLayoutDirection>({
    key: 'recordFieldInputLayoutDirectionComponentState',
    defaultValue: 'upward',
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

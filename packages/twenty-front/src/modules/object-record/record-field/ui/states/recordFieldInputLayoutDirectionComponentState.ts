import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type FieldInputLayoutDirection } from '@/object-record/record-field/ui/types/FieldInputLayoutDirection';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordFieldInputLayoutDirectionComponentState =
  createComponentStateV2<FieldInputLayoutDirection>({
    key: 'recordFieldInputLayoutDirectionComponentState',
    defaultValue: 'upward',
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

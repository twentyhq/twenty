import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordFieldInputLayoutDirectionLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'recordFieldInputLayoutDirectionLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

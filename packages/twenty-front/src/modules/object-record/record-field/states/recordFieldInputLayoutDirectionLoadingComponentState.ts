import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordFieldInputLayoutDirectionLoadingComponentState =
  createComponentState<boolean>({
    key: 'recordFieldInputLayoutDirectionLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

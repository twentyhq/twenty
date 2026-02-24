import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordFieldInputLayoutDirectionLoadingComponentState =
  createComponentState<boolean>({
    key: 'recordFieldInputLayoutDirectionLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

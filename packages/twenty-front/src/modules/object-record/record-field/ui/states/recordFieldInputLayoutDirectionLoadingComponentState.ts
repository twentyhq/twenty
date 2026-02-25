import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordFieldInputLayoutDirectionLoadingComponentState =
  createAtomComponentState<boolean>({
    key: 'recordFieldInputLayoutDirectionLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

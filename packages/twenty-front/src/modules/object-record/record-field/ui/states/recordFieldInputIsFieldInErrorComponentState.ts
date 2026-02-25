import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordFieldInputIsFieldInErrorComponentState =
  createAtomComponentState<boolean>({
    key: 'recordFieldInputIsFieldInErrorComponentState',
    defaultValue: false,
    componentInstanceContext: RecordFieldComponentInstanceContext,
  });

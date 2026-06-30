import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordTableWentFromEmptyToNotEmptyComponentState =
  createAtomComponentState<boolean>({
    key: 'recordTableWentFromEmptyToNotEmptyComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });

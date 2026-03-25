import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lowDetailsActivatedComponentState =
  createAtomComponentState<boolean>({
    key: 'lowDetailsActivatedComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });

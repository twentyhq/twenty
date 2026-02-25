import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastScrollPositionComponentState =
  createAtomComponentState<number>({
    key: 'lastScrollPositionComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: 0,
  });

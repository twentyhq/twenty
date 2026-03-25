import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastRealIndexSetComponentState = createAtomComponentState<
  number | null
>({
  key: 'lastRealIndexSetComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: null,
});

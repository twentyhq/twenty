import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const currentRecordFilterGroupsComponentState = createAtomComponentState<
  RecordFilterGroup[]
>({
  key: 'currentRecordFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
});

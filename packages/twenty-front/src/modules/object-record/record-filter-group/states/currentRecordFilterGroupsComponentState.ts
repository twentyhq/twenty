import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const currentRecordFilterGroupsComponentState = createComponentState<
  RecordFilterGroup[]
>({
  key: 'currentRecordFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
});

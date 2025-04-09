import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const currentRecordFilterGroupsComponentState = createComponentStateV2<
  RecordFilterGroup[]
>({
  key: 'currentRecordFilterGroupsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
});

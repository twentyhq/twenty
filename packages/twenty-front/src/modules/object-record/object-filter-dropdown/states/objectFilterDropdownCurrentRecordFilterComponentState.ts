import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const objectFilterDropdownCurrentRecordFilterComponentState =
  createComponentState<RecordFilter | undefined | null>({
    key: 'objectFilterDropdownCurrentRecordFilterComponentState',
    defaultValue: undefined,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });

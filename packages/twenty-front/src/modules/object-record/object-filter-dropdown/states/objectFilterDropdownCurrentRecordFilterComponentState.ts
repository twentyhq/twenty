import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const objectFilterDropdownCurrentRecordFilterComponentState =
  createAtomComponentState<RecordFilter | undefined | null>({
    key: 'objectFilterDropdownCurrentRecordFilterComponentState',
    defaultValue: undefined,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });

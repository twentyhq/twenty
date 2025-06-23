import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { RecordFilter } from '../../record-filter/types/RecordFilter';

export const objectFilterDropdownCurrentRecordFilterComponentState =
  createComponentStateV2<RecordFilter | undefined | null>({
    key: 'objectFilterDropdownCurrentRecordFilterComponentState',
    defaultValue: undefined,
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });

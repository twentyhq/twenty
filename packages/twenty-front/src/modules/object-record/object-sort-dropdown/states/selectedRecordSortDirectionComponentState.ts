import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { RecordSortDirection } from '@/object-record/record-sort/types/RecordSortDirection';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const selectedRecordSortDirectionComponentState =
  createComponentStateV2<RecordSortDirection>({
    key: 'selectedRecordSortDirectionComponentState',
    defaultValue: 'asc',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

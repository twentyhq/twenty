import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { RecordSortDirection } from '@/object-record/record-sort/types/RecordSortDirection';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const selectedRecordSortDirectionComponentState =
  createComponentState<RecordSortDirection>({
    key: 'selectedRecordSortDirectionComponentState',
    defaultValue: 'asc',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

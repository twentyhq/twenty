import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { SortDirection } from '@/object-record/object-sort-dropdown/types/SortDirection';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const selectedSortDirectionComponentState =
  createComponentStateV2<SortDirection>({
    key: 'selectedSortDirectionComponentState',
    defaultValue: 'asc',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

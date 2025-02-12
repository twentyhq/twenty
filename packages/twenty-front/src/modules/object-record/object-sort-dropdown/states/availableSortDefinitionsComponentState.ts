import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { SortDefinition } from '../types/SortDefinition';

export const availableSortDefinitionsComponentState = createComponentStateV2<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsComponentState',
  defaultValue: [],
  componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
});

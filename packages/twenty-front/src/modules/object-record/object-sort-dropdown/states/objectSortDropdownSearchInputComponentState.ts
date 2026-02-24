import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const objectSortDropdownSearchInputComponentState =
  createComponentState<string>({
    key: 'objectSortDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

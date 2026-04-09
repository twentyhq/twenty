import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const objectSortDropdownSearchInputComponentState =
  createAtomComponentState<string>({
    key: 'objectSortDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

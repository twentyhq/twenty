import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const objectSortDropdownSearchInputComponentState =
  createComponentStateV2<string>({
    key: 'objectSortDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

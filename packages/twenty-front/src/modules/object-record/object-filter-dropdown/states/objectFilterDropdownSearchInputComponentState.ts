import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const objectFilterDropdownSearchInputComponentState =
  createAtomComponentState<string>({
    key: 'objectFilterDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ObjectFilterDropdownComponentInstanceContext,
  });

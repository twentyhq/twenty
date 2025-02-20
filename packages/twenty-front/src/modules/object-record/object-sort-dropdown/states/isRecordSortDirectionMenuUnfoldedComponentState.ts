import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isRecordSortDirectionMenuUnfoldedComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordSortDirectionMenuUnfoldedComponentState',
    defaultValue: false,
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });

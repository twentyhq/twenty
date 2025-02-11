import { ExpandableInputInstanceContext } from '@/ui/input/states/contexts/ExpandableInputInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isExpandableInputOpenedComponentState =
  createComponentStateV2<boolean>({
    key: 'isExpandableInputOpenedComponentState',
    defaultValue: false,
    componentInstanceContext: ExpandableInputInstanceContext,
  });

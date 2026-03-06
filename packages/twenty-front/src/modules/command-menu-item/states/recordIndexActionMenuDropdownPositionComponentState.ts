import { ActionMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/ActionMenuComponentInstanceContext';
import { type PositionType } from '@/command-menu-item/types/PositionType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexActionMenuDropdownPositionComponentState =
  createAtomComponentState<PositionType>({
    key: 'recordIndexActionMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
    componentInstanceContext: ActionMenuComponentInstanceContext,
  });

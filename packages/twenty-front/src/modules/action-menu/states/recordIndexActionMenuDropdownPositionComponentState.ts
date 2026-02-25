import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { type PositionType } from '@/action-menu/types/PositionType';
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

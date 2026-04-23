import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { type PositionType } from '@/command-menu-item/types/PositionType';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexCommandMenuDropdownPositionComponentState =
  createAtomComponentState<PositionType>({
    key: 'recordIndexCommandMenuDropdownPositionComponentState',
    defaultValue: {
      x: null,
      y: null,
    },
    componentInstanceContext: CommandMenuComponentInstanceContext,
  });

import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { type RecordIndexCommandMenuDropdownTargetCell } from '@/command-menu-item/types/RecordIndexCommandMenuDropdownTargetCell';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordIndexCommandMenuDropdownTargetCellComponentState =
  createAtomComponentState<RecordIndexCommandMenuDropdownTargetCell | null>({
    key: 'recordIndexCommandMenuDropdownTargetCellComponentState',
    defaultValue: null,
    componentInstanceContext: CommandMenuComponentInstanceContext,
  });

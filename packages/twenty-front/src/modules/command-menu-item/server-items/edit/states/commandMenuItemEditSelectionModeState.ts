import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type CommandMenuItemEditSelectionMode = 'none' | 'selection';

export const commandMenuItemEditSelectionModeState =
  createAtomState<CommandMenuItemEditSelectionMode>({
    key: 'commandMenuItemEditSelectionModeState',
    defaultValue: 'selection',
  });

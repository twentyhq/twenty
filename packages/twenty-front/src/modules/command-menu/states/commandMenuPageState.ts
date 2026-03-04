import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { SidePanelPages } from 'twenty-shared/types';

export const commandMenuPageState = createAtomState<SidePanelPages>({
  key: 'command-menu/commandMenuPageState',
  defaultValue: SidePanelPages.Root,
});

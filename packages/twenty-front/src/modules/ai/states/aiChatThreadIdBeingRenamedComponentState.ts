import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatThreadIdBeingRenamedComponentState =
  createAtomComponentState<string | null>({
    key: 'aiChatThreadIdBeingRenamedComponentState',
    defaultValue: null,
    componentInstanceContext: CommandMenuComponentInstanceContext,
  });

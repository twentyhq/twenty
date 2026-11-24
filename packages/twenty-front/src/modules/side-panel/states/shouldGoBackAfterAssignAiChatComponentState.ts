import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const shouldGoBackAfterAssignAiChatComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/should-go-back-after-assign-ai-chat',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });

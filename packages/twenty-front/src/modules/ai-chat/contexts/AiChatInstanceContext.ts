import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type AiChatInstanceContextValue = ComponentStateKey & {
  threadId: string;
  onThreadChange: (threadId: string) => void;
};

export const AiChatInstanceContext =
  createComponentInstanceContext<AiChatInstanceContextValue>();

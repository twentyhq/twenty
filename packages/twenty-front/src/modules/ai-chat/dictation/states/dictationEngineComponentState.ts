import { type DictationEngine } from '@/ai-chat/dictation/types/DictationEngine';
import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Only set while the surface can dictate; the control renders on its presence.
export const dictationEngineComponentState =
  createAtomComponentState<DictationEngine | null>({
    key: 'ai/dictationEngineComponentState',
    defaultValue: null,
    componentInstanceContext: AiChatInstanceContext,
  });

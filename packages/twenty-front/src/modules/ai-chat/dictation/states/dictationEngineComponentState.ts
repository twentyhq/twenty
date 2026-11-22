import { type DictationEngine } from '@/ai-chat/dictation/types/DictationEngine';
import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const dictationEngineComponentState =
  createAtomComponentState<DictationEngine | null>({
    key: 'ai/dictationEngineComponentState',
    defaultValue: null,
    componentInstanceContext: AiChatInstanceContext,
  });

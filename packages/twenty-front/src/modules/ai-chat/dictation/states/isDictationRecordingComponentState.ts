import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isDictationRecordingComponentState =
  createAtomComponentState<boolean>({
    key: 'ai/isDictationRecordingComponentState',
    defaultValue: false,
    componentInstanceContext: AiChatInstanceContext,
  });

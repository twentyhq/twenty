import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AiChatPrepromptMode = 'PREFILL' | 'SEND';

export type AiChatPreprompt = {
  serializedDocument: string;
  mode: AiChatPrepromptMode;
};

export const aiChatPrepromptState = createAtomState<AiChatPreprompt | null>({
  key: 'ai/aiChatPrepromptState',
  defaultValue: null,
});

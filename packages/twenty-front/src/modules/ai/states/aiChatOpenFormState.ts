import { type AiChatOpenFormRegistration } from '@/ai/types/AiChatOpenFormRegistration';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatOpenFormState =
  createAtomState<AiChatOpenFormRegistration | null>({
    key: 'ai/aiChatOpenFormState',
    defaultValue: null,
  });

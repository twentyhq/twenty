import { WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { createState } from 'twenty-ui/utilities';

export const selectedChatState = createState<WhatsappDocument | null>({
  key: 'selectedChatState',
  defaultValue: null,
});

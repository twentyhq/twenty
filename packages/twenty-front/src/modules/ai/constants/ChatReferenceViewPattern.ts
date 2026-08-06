import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_VIEW_PATTERN = `\\[\\[view:(?<viewId>${CHAT_REFERENCE_UUID_PATTERN}):(?<viewLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;

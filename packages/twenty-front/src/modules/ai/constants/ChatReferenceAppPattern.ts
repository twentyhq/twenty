import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_APP_PATTERN = `\\[\\[app:(?<applicationId>${CHAT_REFERENCE_UUID_PATTERN}):(?<applicationLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;

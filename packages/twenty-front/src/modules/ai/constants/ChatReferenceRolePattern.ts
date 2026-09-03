import { CHAT_REFERENCE_LABEL_PATTERN } from '@/ai/constants/ChatReferenceLabelPattern';
import { CHAT_REFERENCE_UUID_PATTERN } from '@/ai/constants/ChatReferenceUuidPattern';

export const CHAT_REFERENCE_ROLE_PATTERN = `\\[\\[role:(?<roleId>${CHAT_REFERENCE_UUID_PATTERN}):(?<roleLabel>${CHAT_REFERENCE_LABEL_PATTERN})\\]\\]`;

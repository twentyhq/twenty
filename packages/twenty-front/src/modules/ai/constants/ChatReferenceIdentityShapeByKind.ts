import { CHAT_REFERENCE_METADATA_NAME_REGEX } from '@/ai/constants/ChatReferenceMetadataNameRegex';
import { CHAT_REFERENCE_UUID_REGEX } from '@/ai/constants/ChatReferenceUuidRegex';
import { type ChatReferenceKind } from '@/ai/types/ChatReferenceKind';

export const CHAT_REFERENCE_IDENTITY_SHAPE_BY_KIND: Record<
  ChatReferenceKind,
  readonly RegExp[]
> = {
  record: [CHAT_REFERENCE_METADATA_NAME_REGEX, CHAT_REFERENCE_UUID_REGEX],
  records: [CHAT_REFERENCE_UUID_REGEX],
  object: [CHAT_REFERENCE_METADATA_NAME_REGEX],
  field: [
    CHAT_REFERENCE_METADATA_NAME_REGEX,
    CHAT_REFERENCE_METADATA_NAME_REGEX,
  ],
  view: [CHAT_REFERENCE_UUID_REGEX],
  role: [CHAT_REFERENCE_UUID_REGEX],
  app: [CHAT_REFERENCE_UUID_REGEX],
};

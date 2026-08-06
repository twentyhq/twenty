import { CHAT_REFERENCE_FIELD_PATTERN } from '@/ai/constants/ChatReferenceFieldPattern';
import { CHAT_REFERENCE_OBJECT_PATTERN } from '@/ai/constants/ChatReferenceObjectPattern';
import { CHAT_REFERENCE_RECORD_PATTERN } from '@/ai/constants/ChatReferenceRecordPattern';
import { CHAT_REFERENCE_VIEW_PATTERN } from '@/ai/constants/ChatReferenceViewPattern';

// The record pattern must stay last: its `record:` prefix is optional, so it
// matches the metadata markers too and would swallow them if tried first.
export const CHAT_REFERENCE_REGEX = new RegExp(
  [
    CHAT_REFERENCE_OBJECT_PATTERN,
    CHAT_REFERENCE_FIELD_PATTERN,
    CHAT_REFERENCE_VIEW_PATTERN,
    CHAT_REFERENCE_RECORD_PATTERN,
  ].join('|'),
  'g',
);

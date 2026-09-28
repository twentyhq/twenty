import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';

export const serializeMentionTagAsAdvancedTextEditorDocument = (
  mentionTag: Parameters<typeof getMentionTagContent>[0],
): string =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
    content: [
      { type: 'paragraph', content: getMentionTagContent(mentionTag) },
    ],
  });

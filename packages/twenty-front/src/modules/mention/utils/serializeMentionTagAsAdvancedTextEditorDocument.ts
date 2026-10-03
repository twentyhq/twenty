import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';

export const serializeMentionTagAsAdvancedTextEditorDocument = (
  mentionTag: Parameters<typeof getMentionTagContent>[0],
): string =>
  serializeJsonContentAsAdvancedTextEditorDocument({
    type: 'doc',
    content: [{ type: 'paragraph', content: getMentionTagContent(mentionTag) }],
  });

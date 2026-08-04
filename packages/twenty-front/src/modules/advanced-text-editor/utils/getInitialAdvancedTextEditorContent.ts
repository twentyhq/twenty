import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import type { JSONContent } from '@tiptap/react';

// Campaign bodies were stored as the editor's own HTML before they moved to
// JSON. TipTap parses an HTML string natively, so hand it through untouched
// rather than letting the plain-text fallback render the markup as literal
// text. Requiring a leading tag keeps plain-text bodies, which need the
// variable-tag conversion below, out of this branch.
const LEADING_HTML_TAG_PATTERN = /^<[a-z][a-z0-9]*(\s[^>]*)?>/i;

// Previous format of the email body was plain text,
// but from now on we will save it as JSON.
// So it will fail to parse the content, that's why we have this fallback.
export const getInitialAdvancedTextEditorContent = (
  rawContent: string,
): JSONContent | string => {
  // Handle empty or null content
  if (!rawContent || rawContent.trim() === '') {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    };
  }

  try {
    const json = JSON.parse(rawContent);

    // Handle BlockNote array format (wrap in doc structure for TipTap)
    if (Array.isArray(json)) {
      return {
        type: 'doc',
        content: json,
      };
    }

    return json;
  } catch {
    if (LEADING_HTML_TAG_PATTERN.test(rawContent.trim())) {
      return rawContent;
    }

    return getInitialEditorContent(rawContent);
  }
};

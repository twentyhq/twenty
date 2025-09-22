import { getInitialEditorContent } from '@/workflow/workflow-variables/utils/getInitialEditorContent';
import type { JSONContent } from '@tiptap/react';
import { logError } from '~/utils/logError';

// Previous format of the email body was plain text,
// but from now on we will save it as JSON.
// So it will fail to parse the content, that's why we have this fallback.
export const getInitialEmailEditorContent = (
  rawContent: string,
): JSONContent => {
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
    return json;
  } catch (error) {
    logError(error);
    return getInitialEditorContent(rawContent);
  }
};

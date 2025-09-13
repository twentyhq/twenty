import { getInitialEditorContent } from '@/workflow/workflow-variables/utils/getInitialEditorContent';
import type { JSONContent } from '@tiptap/react';
import { logError } from '~/utils/logError';

/**
 * Previous format of the email body was plain text,
 * but from now on we will save it as JSON.
 * So it will fail to parse the content, that's why we have this fallback.
 *
 * @param rawContent - The raw content to parse.
 * @returns The parsed content.
 */
export const getInitialEmailEditorContent = (
  rawContent: string,
): JSONContent => {
  try {
    const json = JSON.parse(rawContent);
    return json;
  } catch (error) {
    logError(error);
    return getInitialEditorContent(rawContent);
  }
};

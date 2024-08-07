import { isArray, isNonEmptyString } from '@sniptt/guards';

// TODO: merge with getFirstNonEmptyLineOfRichText
export const getActivitySummary = (activityBody: string | null) => {
  const noteBody = activityBody ? JSON.parse(activityBody) : [];

  if (!noteBody.length) {
    return '';
  }

  const firstNoteBlockContent = noteBody[0].content;

  if (!firstNoteBlockContent) {
    return '';
  }

  if (isNonEmptyString(firstNoteBlockContent.text)) {
    return noteBody[0].content.text;
  }

  if (isArray(firstNoteBlockContent)) {
    return firstNoteBlockContent.map((content: any) => content.text).join(' ');
  }

  return '';
};

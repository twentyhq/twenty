import type { PartialBlock } from '@blocknote/core';
import { isArray, isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

// TODO: merge with getFirstNonEmptyLineOfRichText
export const getActivitySummary = (activityBody: string | null) => {
  const noteBody = activityBody
    ? (parseJson<PartialBlock[]>(activityBody) ?? [])
    : [];

  if (!noteBody.length) {
    return '';
  }

  const firstNoteBlockContent = noteBody[0].content as
    | { text?: string }[]
    | { text?: string }
    | undefined;

  if (!firstNoteBlockContent) {
    return '';
  }

  if (!isArray(firstNoteBlockContent)) {
    return isNonEmptyString(firstNoteBlockContent.text)
      ? firstNoteBlockContent.text
      : '';
  }

  return firstNoteBlockContent
    .map((content) => content.text ?? '')
    .filter(isNonEmptyString)
    .join(' ');
};

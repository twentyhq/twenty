import { isNonEmptyString } from '@sniptt/guards';

import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';

export const formatGranolaSummary = (
  note: Pick<GranolaNote, 'summary_markdown' | 'summary_text'>,
): string => {
  const markdown = note.summary_markdown?.trim();

  return isNonEmptyString(markdown) ? markdown : note.summary_text.trim();
};

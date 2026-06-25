import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import { getFirstNonEmptyLineOfRichText } from '@/blocknote-editor/utils/getFirstNonEmptyLineOfRichText';

export const getActivitySummary = (activityBody: string | null): string => {
  const blocks = parseInitialBlocknote(activityBody) ?? null;

  return getFirstNonEmptyLineOfRichText(blocks);
};

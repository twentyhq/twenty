import { isNonEmptyString } from '@sniptt/guards';

const REASONING_TITLE_REGEX = /^\*\*(.+?)\*\*\s*$/gm;

export const getLatestReasoningTitle = (text: string): string | null => {
  const latestTitle = [...text.matchAll(REASONING_TITLE_REGEX)]
    .at(-1)?.[1]
    ?.trim();

  return isNonEmptyString(latestTitle) ? latestTitle : null;
};

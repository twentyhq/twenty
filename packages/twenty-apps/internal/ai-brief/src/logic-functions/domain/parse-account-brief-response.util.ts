import { isAccountSentiment, type AccountSentiment } from 'src/constants/target-types';

const SENTIMENT_LINE_PREFIX = 'SENTIMENT:';

export type ParsedAccountBriefResponse = {
  briefMarkdown: string;
  sentiment: AccountSentiment;
};

// The agent contract (see ACCOUNT_BRIEF_SYSTEM_PROMPT): a MARKDOWN brief whose
// final line is `SENTIMENT: <value>`. The sentiment line is always stripped
// from the brief; unrecognized values fall back to NEUTRAL so a sloppy
// completion never blocks the brief from landing.
export const parseAccountBriefResponse = (
  rawResponse: string,
): ParsedAccountBriefResponse => {
  const trimmedResponse = rawResponse.trim();
  const lines = trimmedResponse.split('\n');
  const lastLine = (lines[lines.length - 1] ?? '').trim();

  if (!lastLine.toUpperCase().startsWith(SENTIMENT_LINE_PREFIX)) {
    return { briefMarkdown: trimmedResponse, sentiment: 'NEUTRAL' };
  }

  const sentimentValue = lastLine
    .slice(SENTIMENT_LINE_PREFIX.length)
    .trim()
    .toUpperCase();

  const briefMarkdown = lines.slice(0, -1).join('\n').trim();

  if (briefMarkdown.length === 0) {
    // Nothing outside the sentiment line: the completion did not follow the
    // contract; keep the raw text and stay neutral.
    return { briefMarkdown: trimmedResponse, sentiment: 'NEUTRAL' };
  }

  return {
    briefMarkdown,
    sentiment: isAccountSentiment(sentimentValue) ? sentimentValue : 'NEUTRAL',
  };
};

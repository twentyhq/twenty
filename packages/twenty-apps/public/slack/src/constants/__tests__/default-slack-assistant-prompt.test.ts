import { describe, expect, it } from 'vitest';

import { DEFAULT_SLACK_ASSISTANT_PROMPT } from 'src/constants/default-slack-assistant-prompt';
import { SLACK_RECORD_SUMMARY_MAX_COUNT } from 'src/constants/slack-record-summary-max-count';

describe('DEFAULT_SLACK_ASSISTANT_PROMPT', () => {
  it('should cap its record list at the count the worker renders summaries for', () => {
    expect(DEFAULT_SLACK_ASSISTANT_PROMPT).toContain(
      `List at most ${SLACK_RECORD_SUMMARY_MAX_COUNT} records`,
    );
  });

  it('should not name any other record list cap', () => {
    const listCaps = [
      ...DEFAULT_SLACK_ASSISTANT_PROMPT.matchAll(/List at most (\d+) records/g),
    ].map(([, count]) => Number(count));

    expect(listCaps).toEqual([SLACK_RECORD_SUMMARY_MAX_COUNT]);
  });
});

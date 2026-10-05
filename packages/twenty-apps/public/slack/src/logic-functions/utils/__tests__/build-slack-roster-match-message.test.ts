import { describe, expect, it } from 'vitest';

import { type SlackRosterMatchSummary } from 'src/logic-functions/types/slack-roster-match.type';
import { buildSlackRosterMatchMessage } from 'src/logic-functions/utils/build-slack-roster-match-message';

const buildSummary = (
  summary: Partial<SlackRosterMatchSummary>,
): SlackRosterMatchSummary => ({
  linkedCount: 0,
  alreadyLinkedCount: 0,
  unmatchedCount: 0,
  ambiguousEmailCount: 0,
  failedCount: 0,
  isRosterTruncated: false,
  ...summary,
});

describe('buildSlackRosterMatchMessage', () => {
  it('should report a clean run with nothing else to say', () => {
    expect(buildSlackRosterMatchMessage(buildSummary({ linkedCount: 2 }))).toBe(
      'Matched 2 Slack users by email.',
    );
  });

  it('should keep the count singular for a single match', () => {
    expect(buildSlackRosterMatchMessage(buildSummary({ linkedCount: 1 }))).toBe(
      'Matched 1 Slack user by email.',
    );
  });

  it('should mention every non-zero tally', () => {
    expect(
      buildSlackRosterMatchMessage(
        buildSummary({
          linkedCount: 3,
          alreadyLinkedCount: 4,
          unmatchedCount: 5,
          ambiguousEmailCount: 2,
          failedCount: 1,
        }),
      ),
    ).toBe(
      'Matched 3 Slack users by email. 4 already linked. 5 without a matching member email. 2 skipped because their email belongs to more than one workspace member. 1 could not be linked; try the match again.',
    );
  });

  it('should warn that the roster was only partly scanned', () => {
    expect(
      buildSlackRosterMatchMessage(buildSummary({ isRosterTruncated: true })),
    ).toBe(
      'Matched 0 Slack users by email. The Slack roster is too large to scan in one pass, so some users were not checked.',
    );
  });
});

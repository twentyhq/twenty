import { describe, expect, it } from 'vitest';

import { buildTeamsDirectoryMatchMessage } from 'src/features/chat/logic-functions/utils/build-teams-directory-match-message';

describe('buildTeamsDirectoryMatchMessage', () => {
  it('appends every non-zero count and the truncation note', () => {
    expect(
      buildTeamsDirectoryMatchMessage({
        linkedCount: 2,
        alreadyLinkedCount: 3,
        unmatchedCount: 4,
        ambiguousEmailCount: 1,
        failedCount: 1,
        isDirectoryTruncated: true,
      }),
    ).toBe(
      'Matched 2 Teams users by email. 3 already linked. 4 without a matching member email. 1 skipped because their email belongs to more than one workspace member. 1 could not be linked; try the match again. The organization directory is too large to scan in one pass, so some users were not checked.',
    );
  });
});

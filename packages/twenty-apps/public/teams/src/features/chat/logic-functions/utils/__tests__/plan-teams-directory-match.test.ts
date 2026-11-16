import { describe, expect, it } from 'vitest';

import { planTeamsDirectoryMatch } from 'src/features/chat/logic-functions/utils/plan-teams-directory-match';

const ADA = { id: 'aad-ada', displayName: 'Ada', mail: 'Ada@twenty.com' };
const BOB = { id: 'aad-bob', displayName: 'Bob', mail: 'bob@twenty.com' };
const GUEST = {
  id: 'aad-guest',
  displayName: 'Guest',
  mail: 'ada@twenty.com',
  userPrincipalName: 'ada_twenty.com#EXT#@partner.onmicrosoft.com',
};

describe('planTeamsDirectoryMatch', () => {
  it('splits directory users into candidates, already linked and unmatched', () => {
    expect(
      planTeamsDirectoryMatch({
        users: [ADA, BOB, GUEST, { id: 'aad-linked', mail: 'x@twenty.com' }],
        workspaceMemberIdByEmail: new Map([['ada@twenty.com', 'member-ada']]),
        linkedAadObjectIds: new Set(['aad-linked']),
      }),
    ).toEqual({
      candidates: [
        {
          teamsUserAadObjectId: 'aad-ada',
          workspaceMemberId: 'member-ada',
          displayName: 'Ada',
        },
      ],
      alreadyLinkedCount: 1,
      unmatchedCount: 2,
    });
  });
});

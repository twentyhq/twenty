import { describe, expect, it } from 'vitest';

import { isMeetAiSummaryEnabledForMember } from 'src/logic-functions/utils/is-meet-ai-summary-enabled-for-member.util';

const buildMember = ({
  userWorkspaceId,
  aiSummaryEnabled,
}: {
  userWorkspaceId: string;
  aiSummaryEnabled: string;
}) => ({
  userWorkspaceId,
  variables: [
    { key: 'GOOGLE_MEET_AI_SUMMARY_ENABLED', value: aiSummaryEnabled },
  ],
});

describe('isMeetAiSummaryEnabledForMember', () => {
  it('should follow the setting of the member who owns the call', () => {
    const memberApplicationVariables = [
      buildMember({ userWorkspaceId: 'alice', aiSummaryEnabled: 'false' }),
      buildMember({ userWorkspaceId: 'bob', aiSummaryEnabled: 'true' }),
    ];

    expect(
      isMeetAiSummaryEnabledForMember({
        memberApplicationVariables,
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
    expect(
      isMeetAiSummaryEnabledForMember({
        memberApplicationVariables,
        userWorkspaceId: 'bob',
      }),
    ).toBe(true);
  });

  it('should not summarize when the owner or their setting cannot be found', () => {
    expect(
      isMeetAiSummaryEnabledForMember({
        memberApplicationVariables: [],
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
    expect(
      isMeetAiSummaryEnabledForMember({
        memberApplicationVariables: [
          { userWorkspaceId: 'alice', variables: [] },
        ],
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
  });
});

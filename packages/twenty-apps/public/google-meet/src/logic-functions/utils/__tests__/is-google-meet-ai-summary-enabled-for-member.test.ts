import { describe, expect, it } from 'vitest';

import { isGoogleMeetAiSummaryEnabledForMember } from 'src/logic-functions/utils/is-google-meet-ai-summary-enabled-for-member.util';

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

describe('isGoogleMeetAiSummaryEnabledForMember', () => {
  it('should follow the setting of the member who owns the call', () => {
    const memberApplicationVariables = [
      buildMember({ userWorkspaceId: 'alice', aiSummaryEnabled: 'false' }),
      buildMember({ userWorkspaceId: 'bob', aiSummaryEnabled: 'true' }),
    ];

    expect(
      isGoogleMeetAiSummaryEnabledForMember({
        memberApplicationVariables,
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
    expect(
      isGoogleMeetAiSummaryEnabledForMember({
        memberApplicationVariables,
        userWorkspaceId: 'bob',
      }),
    ).toBe(true);
  });

  it('should not summarize when the owner or their setting cannot be found', () => {
    expect(
      isGoogleMeetAiSummaryEnabledForMember({
        memberApplicationVariables: [],
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
    expect(
      isGoogleMeetAiSummaryEnabledForMember({
        memberApplicationVariables: [
          { userWorkspaceId: 'alice', variables: [] },
        ],
        userWorkspaceId: 'alice',
      }),
    ).toBe(false);
  });
});

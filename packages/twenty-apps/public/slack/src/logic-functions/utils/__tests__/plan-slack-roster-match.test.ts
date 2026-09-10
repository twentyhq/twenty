import { describe, expect, it } from 'vitest';

import { type LinkableSlackRosterMember } from 'src/logic-functions/types/slack-roster-member.type';
import { planSlackRosterMatch } from 'src/logic-functions/utils/plan-slack-roster-match';

const INSTALLED_TEAM_ID = 'T-installed';

const fullMember = ({
  id,
  email,
  displayName,
}: {
  id: string;
  email?: string;
  displayName?: string;
}): LinkableSlackRosterMember => ({
  id,
  team_id: INSTALLED_TEAM_ID,
  is_email_confirmed: true,
  real_name: displayName,
  profile: { email, display_name: displayName },
});

const planMatch = ({
  members,
  workspaceMemberIdByEmail = new Map([['ada@twenty.com', 'member-ada']]),
  linkedSlackUserIds = new Set<string>(),
}: {
  members: LinkableSlackRosterMember[];
  workspaceMemberIdByEmail?: Map<string, string>;
  linkedSlackUserIds?: Set<string>;
}) =>
  planSlackRosterMatch({
    members,
    workspaceMemberIdByEmail,
    linkedSlackUserIds,
    installedSlackTeamId: INSTALLED_TEAM_ID,
  });

describe('planSlackRosterMatch', () => {
  it('should plan a candidate for a member whose vouched email matches', () => {
    const plan = planMatch({
      members: [
        fullMember({ id: 'U1', email: 'ada@twenty.com', displayName: 'ada' }),
      ],
    });

    expect(plan.candidates).toEqual([
      {
        slackUserId: 'U1',
        workspaceMemberId: 'member-ada',
        displayName: 'ada',
      },
    ]);
    expect(plan.alreadyLinkedCount).toBe(0);
    expect(plan.unmatchedCount).toBe(0);
  });

  it('should match the email case-insensitively', () => {
    const plan = planMatch({
      members: [fullMember({ id: 'U1', email: 'Ada@Twenty.com' })],
    });

    expect(plan.candidates).toHaveLength(1);
  });

  it('should skip a Slack user that already has a link', () => {
    const plan = planMatch({
      members: [fullMember({ id: 'U1', email: 'ada@twenty.com' })],
      linkedSlackUserIds: new Set(['U1']),
    });

    expect(plan.candidates).toEqual([]);
    expect(plan.alreadyLinkedCount).toBe(1);
    expect(plan.unmatchedCount).toBe(0);
  });

  it('should count a member with no matching workspace email as unmatched', () => {
    const plan = planMatch({
      members: [fullMember({ id: 'U1', email: 'grace@twenty.com' })],
    });

    expect(plan.candidates).toEqual([]);
    expect(plan.unmatchedCount).toBe(1);
  });

  it('should not trust the email of a guest or of an account from another workspace', () => {
    const plan = planMatch({
      members: [
        {
          ...fullMember({ id: 'U1', email: 'ada@twenty.com' }),
          is_restricted: true,
        },
        {
          ...fullMember({ id: 'U2', email: 'ada@twenty.com' }),
          team_id: 'T-other',
        },
      ],
    });

    expect(plan.candidates).toEqual([]);
    expect(plan.unmatchedCount).toBe(2);
  });
});

import { describe, expect, it } from 'vitest';

import { buildSlackUserLinkSaveNote } from 'src/front-components/utils/build-slack-user-link-save-note.util';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const buildResolvedUser = (
  overrides: Partial<SlackResolvedUser> = {},
): SlackResolvedUser => ({
  slackUserId: 'U0123456789',
  slackTeamId: 'T0INSTALLED',
  displayName: 'Ada Lovelace',
  email: 'ada@twenty.com',
  isInInstalledWorkspace: true,
  ...overrides,
});

const MEMBER: WorkspaceMemberOption = {
  id: 'member-1',
  name: 'Ada Member',
  userEmail: 'ada@twenty.com',
};

describe('buildSlackUserLinkSaveNote', () => {
  it('should announce an admin-set link for an outside-workspace account', () => {
    expect(
      buildSlackUserLinkSaveNote({
        resolvedUser: buildResolvedUser({ isInInstalledWorkspace: false }),
        selectedMember: MEMBER,
      }),
    ).toContain('admin-set');
  });

  it('should nudge for a member before promising an outcome', () => {
    expect(
      buildSlackUserLinkSaveNote({
        resolvedUser: buildResolvedUser(),
        selectedMember: null,
      }),
    ).toContain('Pick the workspace member');
  });

  it('should announce immediate activation when the emails match', () => {
    expect(
      buildSlackUserLinkSaveNote({
        resolvedUser: buildResolvedUser({ email: 'Ada@Twenty.com' }),
        selectedMember: MEMBER,
      }),
    ).toContain('activates immediately');
  });

  it('should announce the approval request for a mismatched member', () => {
    expect(
      buildSlackUserLinkSaveNote({
        resolvedUser: buildResolvedUser(),
        selectedMember: { ...MEMBER, userEmail: 'bob@twenty.com' },
      }),
    ).toContain('send Ada Lovelace an approval request');
  });
});

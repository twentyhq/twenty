import { collapseOAuthIdentityApplications } from '@/settings/applications/utils/collapseOAuthIdentityApplications';

const CLAUDE_APP_ID = '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff';
const CHATGPT_APP_ID = '6e58bb83-49dc-4d4d-ae82-662890eda505';

const buildApplication = ({
  id,
  universalIdentifier = `${id}-universal-identifier`,
  oAuthIdentityUniversalIdentifier = null,
}: {
  id: string;
  universalIdentifier?: string;
  oAuthIdentityUniversalIdentifier?: string | null;
}) => ({
  id,
  universalIdentifier,
  applicationRegistration: { oAuthIdentityUniversalIdentifier },
});

const EARLIER_CLAUDE_CONNECTION = buildApplication({
  id: 'earlier-claude-connection',
  oAuthIdentityUniversalIdentifier: CLAUDE_APP_ID,
});

const CLAUDE_APP = buildApplication({
  id: 'claude-app',
  universalIdentifier: CLAUDE_APP_ID,
  oAuthIdentityUniversalIdentifier: CLAUDE_APP_ID,
});

const ZAPIER = buildApplication({ id: 'zapier' });

describe('collapseOAuthIdentityApplications', () => {
  it("keeps the app's install in place of earlier connections", () => {
    expect(
      collapseOAuthIdentityApplications([
        EARLIER_CLAUDE_CONNECTION,
        ZAPIER,
        CLAUDE_APP,
      ]).map(({ id }) => id),
    ).toEqual(['zapier', 'claude-app']);
  });

  it('keeps one earlier connection while the app has no install yet', () => {
    const otherEarlierClaudeConnection = buildApplication({
      id: 'other-earlier-claude-connection',
      oAuthIdentityUniversalIdentifier: CLAUDE_APP_ID,
    });

    expect(
      collapseOAuthIdentityApplications([
        EARLIER_CLAUDE_CONNECTION,
        otherEarlierClaudeConnection,
        ZAPIER,
      ]).map(({ id }) => id),
    ).toEqual(['earlier-claude-connection', 'zapier']);
  });

  it('keeps one row per client', () => {
    const chatGpt = buildApplication({
      id: 'chatgpt',
      oAuthIdentityUniversalIdentifier: CHATGPT_APP_ID,
    });

    expect(
      collapseOAuthIdentityApplications([
        CLAUDE_APP,
        chatGpt,
        ZAPIER,
      ]).map(({ id }) => id),
    ).toEqual(['claude-app', 'chatgpt', 'zapier']);
  });

  it('leaves applications without a registration alone', () => {
    const standard = { id: 'standard', applicationRegistration: null };

    expect(collapseOAuthIdentityApplications([standard])).toEqual([
      standard,
    ]);
  });
});

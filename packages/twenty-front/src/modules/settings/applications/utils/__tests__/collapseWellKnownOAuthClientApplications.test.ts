import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { collapseWellKnownOAuthClientApplications } from '@/settings/applications/utils/collapseWellKnownOAuthClientApplications';
import { WellKnownOAuthClient } from '~/generated-metadata/graphql';

const buildApplication = ({
  id,
  universalIdentifier = `${id}-universal-identifier`,
  wellKnownOAuthClient = null,
}: {
  id: string;
  universalIdentifier?: string;
  wellKnownOAuthClient?: WellKnownOAuthClient | null;
}) => ({
  id,
  universalIdentifier,
  applicationRegistration: { wellKnownOAuthClient },
});

const EARLIER_CLAUDE_CONNECTION = buildApplication({
  id: 'earlier-claude-connection',
  wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
});

const SEEDED_CLAUDE = buildApplication({
  id: 'seeded-claude',
  universalIdentifier: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
  wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
});

const ZAPIER = buildApplication({ id: 'zapier' });

describe('collapseWellKnownOAuthClientApplications', () => {
  it('keeps the seeded install of a well-known client in place of earlier connections', () => {
    expect(
      collapseWellKnownOAuthClientApplications([
        EARLIER_CLAUDE_CONNECTION,
        ZAPIER,
        SEEDED_CLAUDE,
      ]).map(({ id }) => id),
    ).toEqual(['zapier', 'seeded-claude']);
  });

  it('keeps one earlier connection while the client has no seeded install yet', () => {
    const otherEarlierClaudeConnection = buildApplication({
      id: 'other-earlier-claude-connection',
      wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
    });

    expect(
      collapseWellKnownOAuthClientApplications([
        EARLIER_CLAUDE_CONNECTION,
        otherEarlierClaudeConnection,
        ZAPIER,
      ]).map(({ id }) => id),
    ).toEqual(['earlier-claude-connection', 'zapier']);
  });

  it('keeps one row per client', () => {
    const chatGpt = buildApplication({
      id: 'chatgpt',
      wellKnownOAuthClient: WellKnownOAuthClient.CHATGPT,
    });

    expect(
      collapseWellKnownOAuthClientApplications([
        SEEDED_CLAUDE,
        chatGpt,
        ZAPIER,
      ]).map(({ id }) => id),
    ).toEqual(['seeded-claude', 'chatgpt', 'zapier']);
  });

  it('leaves applications without a registration alone', () => {
    const standard = { id: 'standard', applicationRegistration: null };

    expect(collapseWellKnownOAuthClientApplications([standard])).toEqual([
      standard,
    ]);
  });
});

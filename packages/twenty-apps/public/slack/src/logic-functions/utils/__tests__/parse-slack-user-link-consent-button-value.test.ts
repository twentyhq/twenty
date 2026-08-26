import { describe, expect, it } from 'vitest';

import { parseSlackUserLinkConsentButtonValue } from 'src/logic-functions/utils/parse-slack-user-link-consent-button-value';

describe('parseSlackUserLinkConsentButtonValue', () => {
  it('should parse a well-formed approve value', () => {
    expect(
      parseSlackUserLinkConsentButtonValue(
        JSON.stringify({
          decision: 'APPROVE',
          slackTeamId: 'T1',
          slackUserId: 'U1',
        }),
      ),
    ).toEqual({ decision: 'APPROVE', slackTeamId: 'T1', slackUserId: 'U1' });
  });

  it('should return undefined for undefined input', () => {
    expect(parseSlackUserLinkConsentButtonValue(undefined)).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    expect(parseSlackUserLinkConsentButtonValue('not json')).toBeUndefined();
  });

  it('should return undefined for an unknown decision', () => {
    expect(
      parseSlackUserLinkConsentButtonValue(
        JSON.stringify({
          decision: 'MAYBE',
          slackTeamId: 'T1',
          slackUserId: 'U1',
        }),
      ),
    ).toBeUndefined();
  });

  it('should return undefined when identity fields are missing', () => {
    expect(
      parseSlackUserLinkConsentButtonValue(
        JSON.stringify({ decision: 'DECLINE', slackTeamId: 'T1' }),
      ),
    ).toBeUndefined();
  });
});

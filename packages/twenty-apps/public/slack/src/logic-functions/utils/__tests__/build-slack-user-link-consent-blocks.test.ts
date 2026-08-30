import { describe, expect, it } from 'vitest';

import { buildSlackUserLinkConsentBlocks } from 'src/logic-functions/utils/build-slack-user-link-consent-blocks';
import { parseSlackUserLinkConsentButtonValue } from 'src/logic-functions/utils/parse-slack-user-link-consent-button-value';

const BLOCK_INPUT = {
  memberName: 'Ada Member',
  slackTeamId: 'T0123456789',
  slackUserId: 'U0123456789',
  workspaceMemberId: 'workspace-member-1',
  slackUserLinkId: 'link-1',
};

const findButtonValue = (decisionActionId: string): string | undefined => {
  const blocks = buildSlackUserLinkConsentBlocks(BLOCK_INPUT);

  for (const block of blocks) {
    if (block.type !== 'actions') {
      continue;
    }

    for (const element of block.elements) {
      if (
        element.type === 'button' &&
        element.action_id?.endsWith(decisionActionId)
      ) {
        return element.value;
      }
    }
  }

  return undefined;
};

// The button value crosses Slack as JSON and is the only thing binding a
// decision to the exact link and member the DM described; the round trip
// pins the encode side to what the consent handler parses.
describe('buildSlackUserLinkConsentBlocks', () => {
  it('should encode an approve value the consent parser reads back intact', () => {
    expect(parseSlackUserLinkConsentButtonValue(findButtonValue(':approve'))).toEqual(
      {
        decision: 'APPROVE',
        slackTeamId: BLOCK_INPUT.slackTeamId,
        slackUserId: BLOCK_INPUT.slackUserId,
        workspaceMemberId: BLOCK_INPUT.workspaceMemberId,
        slackUserLinkId: BLOCK_INPUT.slackUserLinkId,
      },
    );
  });

  it('should encode a decline value the consent parser reads back intact', () => {
    expect(parseSlackUserLinkConsentButtonValue(findButtonValue(':decline'))).toEqual(
      {
        decision: 'DECLINE',
        slackTeamId: BLOCK_INPUT.slackTeamId,
        slackUserId: BLOCK_INPUT.slackUserId,
        workspaceMemberId: BLOCK_INPUT.workspaceMemberId,
        slackUserLinkId: BLOCK_INPUT.slackUserLinkId,
      },
    );
  });

  it('should name the member in the consent message', () => {
    const blocks = buildSlackUserLinkConsentBlocks(BLOCK_INPUT);

    expect(JSON.stringify(blocks)).toContain('Ada Member');
  });

  it('should fall back to a generic clause when the member has no name', () => {
    const blocks = buildSlackUserLinkConsentBlocks({
      ...BLOCK_INPUT,
      memberName: undefined,
    });

    expect(JSON.stringify(blocks)).toContain('a workspace member');
  });
});

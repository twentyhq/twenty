import { describe, expect, it } from 'vitest';

import { isTeamsHelpRequest } from 'src/features/chat/logic-functions/utils/is-teams-help-request';

describe('isTeamsHelpRequest', () => {
  it.each([' Hi ', 'HELP', 'hey...'])(
    'should treat "%s" as a help request',
    (requestText) => {
      expect(isTeamsHelpRequest(requestText)).toBe(true);
    },
  );

  it.each(['help me find the Acme deal', 'hi there', '!help'])(
    'should send "%s" to the assistant',
    (requestText) => {
      expect(isTeamsHelpRequest(requestText)).toBe(false);
    },
  );
});

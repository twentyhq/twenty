import { describe, expect, it } from 'vitest';

import { buildTeamsAssistantRequestName } from 'src/features/chat/logic-functions/utils/build-teams-assistant-request-name';

describe('buildTeamsAssistantRequestName', () => {
  it('should not split a multi-code-point emoji when truncating', () => {
    const familyEmoji = '👨‍👩‍👧';

    expect(
      buildTeamsAssistantRequestName(`${'a'.repeat(57)}${familyEmoji}`),
    ).toBe(`${'a'.repeat(57)}…`);
  });
});

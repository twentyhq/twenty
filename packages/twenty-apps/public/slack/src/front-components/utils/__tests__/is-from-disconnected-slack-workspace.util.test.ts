import { describe, expect, it } from 'vitest';

import { isFromDisconnectedSlackWorkspace } from 'src/front-components/utils/is-from-disconnected-slack-workspace.util';

describe('isFromDisconnectedSlackWorkspace', () => {
  it('should be true only when both team ids are known and differ', () => {
    expect(
      isFromDisconnectedSlackWorkspace({
        slackTeamId: 'T0OLD',
        installedSlackTeamId: 'T0NEW',
      }),
    ).toBe(true);
    expect(
      isFromDisconnectedSlackWorkspace({
        slackTeamId: 'T0NEW',
        installedSlackTeamId: 'T0NEW',
      }),
    ).toBe(false);
  });

  it('should not flag a record or workspace whose team id is unknown', () => {
    expect(
      isFromDisconnectedSlackWorkspace({
        slackTeamId: null,
        installedSlackTeamId: 'T0NEW',
      }),
    ).toBe(false);
    expect(
      isFromDisconnectedSlackWorkspace({
        slackTeamId: 'T0OLD',
        installedSlackTeamId: undefined,
      }),
    ).toBe(false);
  });
});

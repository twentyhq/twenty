import { describe, expect, it } from 'vitest';

import { parseSlackConnectionStatus } from 'src/front-components/utils/parse-slack-connection-status.util';

describe('parseSlackConnectionStatus', () => {
  it('should parse a connected status with its installed team id', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: true,
        installedSlackTeamId: 'T0INSTALLED',
      }),
    ).toEqual({ isSlackConnected: true, installedSlackTeamId: 'T0INSTALLED' });
  });

  it('should leave the team id undefined when the payload omits it', () => {
    expect(
      parseSlackConnectionStatus({ success: true, isConnected: true }),
    ).toEqual({ isSlackConnected: true, installedSlackTeamId: undefined });
  });

  it('should ignore a team id that is not a non-empty string', () => {
    for (const installedSlackTeamId of ['', 42, null, {}]) {
      expect(
        parseSlackConnectionStatus({
          success: true,
          isConnected: true,
          installedSlackTeamId,
        }),
      ).toEqual({ isSlackConnected: true, installedSlackTeamId: undefined });
    }
  });

  it('should report a disconnected status', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: false,
        installedSlackTeamId: 'T0INSTALLED',
      }),
    ).toEqual({ isSlackConnected: false, installedSlackTeamId: undefined });
  });

  it('should fall back on a malformed payload', () => {
    for (const value of [undefined, null, 'connected', []]) {
      expect(parseSlackConnectionStatus(value)).toEqual({
        isSlackConnected: false,
        installedSlackTeamId: undefined,
      });
    }
  });
});

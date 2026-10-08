import { describe, expect, it } from 'vitest';

import { parseSlackConnectionStatus } from 'src/front-components/utils/parse-slack-connection-status.util';

describe('parseSlackConnectionStatus', () => {
  it('should parse a healthy connected status with its installed team id', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: true,
        installedSlackTeamId: 'T0INSTALLED',
        connectionHealth: 'ok',
      }),
    ).toEqual({
      isSlackConnected: true,
      installedSlackTeamId: 'T0INSTALLED',
      connectionHealth: 'ok',
      hasRosterMatchFailed: false,
    });
  });

  it('should leave the team id undefined when the payload omits it', () => {
    expect(
      parseSlackConnectionStatus({ success: true, isConnected: true }),
    ).toEqual({
      isSlackConnected: true,
      installedSlackTeamId: undefined,
      connectionHealth: undefined,
      hasRosterMatchFailed: false,
    });
  });

  it('should ignore a team id that is not a non-empty string', () => {
    for (const installedSlackTeamId of ['', 42, null, {}]) {
      expect(
        parseSlackConnectionStatus({
          success: true,
          isConnected: true,
          installedSlackTeamId,
        }),
      ).toEqual({
        isSlackConnected: true,
        installedSlackTeamId: undefined,
        connectionHealth: undefined,
        hasRosterMatchFailed: false,
      });
    }
  });

  it('should parse a broken connection health', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: true,
        connectionHealth: 'team_claimed_by_another_workspace',
      }),
    ).toEqual({
      isSlackConnected: true,
      installedSlackTeamId: undefined,
      connectionHealth: 'team_claimed_by_another_workspace',
      hasRosterMatchFailed: false,
    });
  });

  it('should drop an unknown health value', () => {
    expect(
      parseSlackConnectionStatus({
        isConnected: true,
        connectionHealth: 'exploded',
      }),
    ).toEqual({
      isSlackConnected: true,
      installedSlackTeamId: undefined,
      connectionHealth: undefined,
      hasRosterMatchFailed: false,
    });
  });

  it('should surface a recorded roster match failure', () => {
    expect(
      parseSlackConnectionStatus({
        isConnected: true,
        connectionHealth: 'ok',
        hasRosterMatchFailed: true,
      }),
    ).toEqual({
      isSlackConnected: true,
      installedSlackTeamId: undefined,
      connectionHealth: 'ok',
      hasRosterMatchFailed: true,
    });
  });

  it('should report a disconnected status', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: false,
        installedSlackTeamId: 'T0INSTALLED',
      }),
    ).toEqual({
      isSlackConnected: false,
      installedSlackTeamId: undefined,
      connectionHealth: undefined,
      hasRosterMatchFailed: false,
    });
  });

  it('should fall back on a malformed payload', () => {
    for (const value of [undefined, null, 'connected', []]) {
      expect(parseSlackConnectionStatus(value)).toEqual({
        isSlackConnected: false,
        installedSlackTeamId: undefined,
        connectionHealth: undefined,
        hasRosterMatchFailed: false,
      });
    }
  });
});

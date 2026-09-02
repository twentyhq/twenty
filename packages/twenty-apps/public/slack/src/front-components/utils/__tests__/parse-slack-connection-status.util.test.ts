import { describe, expect, it } from 'vitest';

import { parseSlackConnectionStatus } from 'src/front-components/utils/parse-slack-connection-status.util';

describe('parseSlackConnectionStatus', () => {
  it('should parse a healthy connected status', () => {
    expect(
      parseSlackConnectionStatus({
        success: true,
        isConnected: true,
        connectionHealth: 'ok',
      }),
    ).toEqual({
      isSlackConnected: true,
      connectionHealth: 'ok',
      hasRosterMatchFailed: false,
    });
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
      connectionHealth: 'ok',
      hasRosterMatchFailed: true,
    });
  });

  it('should treat a malformed payload as disconnected', () => {
    expect(parseSlackConnectionStatus('nope')).toEqual({
      isSlackConnected: false,
      connectionHealth: undefined,
      hasRosterMatchFailed: false,
    });
  });
});

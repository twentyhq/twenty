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
    ).toEqual({ isSlackConnected: true, connectionHealth: 'ok' });
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
    });
  });

  it('should drop an unknown health value', () => {
    expect(
      parseSlackConnectionStatus({
        isConnected: true,
        connectionHealth: 'exploded',
      }),
    ).toEqual({ isSlackConnected: true, connectionHealth: undefined });
  });

  it('should treat a malformed payload as disconnected', () => {
    expect(parseSlackConnectionStatus('nope')).toEqual({
      isSlackConnected: false,
      connectionHealth: undefined,
    });
  });
});

import { describe, expect, it } from 'vitest';

import { isTeamsConnectorServiceUrl } from 'src/logic-functions/utils/is-teams-connector-service-url';

describe('isTeamsConnectorServiceUrl', () => {
  it('should accept the regional Bot Connector host', () => {
    expect(
      isTeamsConnectorServiceUrl('https://smba.trafficmanager.net/amer'),
    ).toBe(true);
  });

  it('should accept the Bot Framework and government cloud hosts', () => {
    expect(isTeamsConnectorServiceUrl('https://api.botframework.com')).toBe(
      true,
    );
    expect(
      isTeamsConnectorServiceUrl(
        'https://smba.infra.gov.botframework.azure.us/gov',
      ),
    ).toBe(true);
  });

  it('should refuse another profile on the shared trafficmanager namespace', () => {
    expect(
      isTeamsConnectorServiceUrl('https://attacker.trafficmanager.net/amer'),
    ).toBe(false);
  });

  it('should refuse a host that only ends with the Bot Connector domain', () => {
    expect(
      isTeamsConnectorServiceUrl(
        'https://smba.trafficmanager.net.attacker.example/amer',
      ),
    ).toBe(false);
  });

  it('should refuse an unrelated host', () => {
    expect(isTeamsConnectorServiceUrl('https://attacker.example/amer')).toBe(
      false,
    );
  });

  it('should refuse a plain http Bot Connector host', () => {
    expect(
      isTeamsConnectorServiceUrl('http://smba.trafficmanager.net/amer'),
    ).toBe(false);
  });

  it('should refuse a value that is not a url', () => {
    expect(isTeamsConnectorServiceUrl('smba.trafficmanager.net')).toBe(false);
  });
});

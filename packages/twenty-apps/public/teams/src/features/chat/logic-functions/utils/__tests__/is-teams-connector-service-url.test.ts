import { describe, expect, it } from 'vitest';

import { isTeamsConnectorServiceUrl } from 'src/features/chat/logic-functions/utils/is-teams-connector-service-url';

describe('isTeamsConnectorServiceUrl', () => {
  it('should accept the regional Bot Connector host', () => {
    expect(
      isTeamsConnectorServiceUrl('https://smba.trafficmanager.net/amer'),
    ).toBe(true);
  });

  it('should accept the GCC Bot Connector host', () => {
    expect(
      isTeamsConnectorServiceUrl(
        'https://smba.infra.gcc.teams.microsoft.com/teams',
      ),
    ).toBe(true);
  });

  it('should accept a Bot Framework host', () => {
    expect(isTeamsConnectorServiceUrl('https://api.botframework.com')).toBe(
      true,
    );
  });

  it('should refuse the government cloud Bot Framework host', () => {
    expect(
      isTeamsConnectorServiceUrl(
        'https://smba.infra.gov.botframework.azure.us/gov',
      ),
    ).toBe(false);
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

  it('should refuse a host that only ends with the Bot Framework name', () => {
    expect(isTeamsConnectorServiceUrl('https://evilbotframework.com')).toBe(
      false,
    );
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

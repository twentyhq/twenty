import { type ApplicationCapability } from 'twenty-shared/application';

import { buildApplicationCapabilityGrantQuery } from 'src/engine/core-modules/application/utils/build-application-capability-grant-query.util';

describe('buildApplicationCapabilityGrantQuery', () => {
  it('should merge supported capabilities with existing grants using distinct values', () => {
    expect(buildApplicationCapabilityGrantQuery(['camera', 'microphone'])).toBe(
      `ARRAY(SELECT DISTINCT capability FROM unnest("grantedCapabilities" || ARRAY['microphone', 'camera']::varchar[]) AS capability)`,
    );
  });

  it('should emit each requested capability only once', () => {
    expect(
      buildApplicationCapabilityGrantQuery(['microphone', 'microphone']),
    ).toBe(
      `ARRAY(SELECT DISTINCT capability FROM unnest("grantedCapabilities" || ARRAY['microphone']::varchar[]) AS capability)`,
    );
  });

  it('should omit unsupported values without interpolating them into SQL', () => {
    const capabilities = [
      'microphone',
      'screen',
      "camera'); SELECT 1; --",
    ] as ApplicationCapability[];

    expect(buildApplicationCapabilityGrantQuery(capabilities)).toBe(
      `ARRAY(SELECT DISTINCT capability FROM unnest("grantedCapabilities" || ARRAY['microphone']::varchar[]) AS capability)`,
    );
  });

  it('should retain a typed empty array when no capability is requested', () => {
    expect(buildApplicationCapabilityGrantQuery([])).toBe(
      `ARRAY(SELECT DISTINCT capability FROM unnest("grantedCapabilities" || ARRAY[]::varchar[]) AS capability)`,
    );
  });
});

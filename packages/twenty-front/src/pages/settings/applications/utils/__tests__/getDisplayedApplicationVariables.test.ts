import { getDisplayedApplicationVariables } from '~/pages/settings/applications/utils/getDisplayedApplicationVariables';

describe('getDisplayedApplicationVariables', () => {
  it('should hide deprecated variables with no value and sort the rest by key', () => {
    const result = getDisplayedApplicationVariables([
      { key: 'ZONE', value: '', isDeprecated: false },
      { key: 'API_KEY', value: '', isDeprecated: true },
      { key: 'LEGACY_KEY', value: 'legacy-value', isDeprecated: true },
    ]);

    expect(result.map(({ key }) => key)).toEqual(['LEGACY_KEY', 'ZONE']);
  });
});

import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';

const buildApplicationVariable = ({
  key,
  value = '',
  isDeprecated = false,
}: {
  key: string;
  value?: string;
  isDeprecated?: boolean;
}) => ({ key, value, isDeprecated });

describe('getDisplayedApplicationVariables', () => {
  it('should hide deprecated variables with no value and sort the rest by key', () => {
    const result = getDisplayedApplicationVariables([
      buildApplicationVariable({ key: 'ZONE' }),
      buildApplicationVariable({ key: 'API_KEY', isDeprecated: true }),
      buildApplicationVariable({
        key: 'LEGACY_KEY',
        value: 'legacy-value',
        isDeprecated: true,
      }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['LEGACY_KEY', 'ZONE']);
  });

  it('should not mutate the variables it was given', () => {
    const applicationVariables = [
      buildApplicationVariable({ key: 'ZONE' }),
      buildApplicationVariable({ key: 'API_KEY' }),
    ];

    getDisplayedApplicationVariables(applicationVariables);

    expect(applicationVariables.map(({ key }) => key)).toEqual([
      'ZONE',
      'API_KEY',
    ]);
  });
});

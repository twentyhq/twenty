import { getDisplayedApplicationVariables } from '~/pages/settings/applications/utils/getDisplayedApplicationVariables';

const makeApplicationVariable = ({
  key,
  value = '',
  isDeprecated = false,
}: {
  key: string;
  value?: string;
  isDeprecated?: boolean;
}) => ({ key, value, isDeprecated });

describe('getDisplayedApplicationVariables', () => {
  it('should drop a deprecated variable with no value', () => {
    const result = getDisplayedApplicationVariables([
      makeApplicationVariable({ key: 'API_KEY', isDeprecated: true }),
    ]);

    expect(result).toEqual([]);
  });

  it('should keep a deprecated variable that still has a value', () => {
    const result = getDisplayedApplicationVariables([
      makeApplicationVariable({
        key: 'API_KEY',
        value: 'legacy-key',
        isDeprecated: true,
      }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['API_KEY']);
  });

  it('should keep a variable that is not deprecated even with no value', () => {
    const result = getDisplayedApplicationVariables([
      makeApplicationVariable({ key: 'NEW_API_KEY' }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['NEW_API_KEY']);
  });

  it('should order the displayed variables by key', () => {
    const result = getDisplayedApplicationVariables([
      makeApplicationVariable({ key: 'ZONE' }),
      makeApplicationVariable({ key: 'API_KEY' }),
      makeApplicationVariable({ key: 'MAX_RETRIES' }),
    ]);

    expect(result.map(({ key }) => key)).toEqual([
      'API_KEY',
      'MAX_RETRIES',
      'ZONE',
    ]);
  });

  it('should not mutate the input array', () => {
    const applicationVariables = [
      makeApplicationVariable({ key: 'ZONE' }),
      makeApplicationVariable({ key: 'API_KEY' }),
    ];

    getDisplayedApplicationVariables(applicationVariables);

    expect(applicationVariables.map(({ key }) => key)).toEqual([
      'ZONE',
      'API_KEY',
    ]);
  });
});

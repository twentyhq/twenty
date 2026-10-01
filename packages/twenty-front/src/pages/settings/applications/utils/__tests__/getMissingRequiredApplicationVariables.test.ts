import { getMissingRequiredApplicationVariables } from '~/pages/settings/applications/utils/getMissingRequiredApplicationVariables';

const buildVariable = (
  overrides: Partial<{
    key: string;
    label: string;
    value: string;
    isRequired: boolean;
  }>,
) => ({
  key: 'KEY',
  label: 'Key',
  value: '',
  isRequired: false,
  ...overrides,
});

describe('getMissingRequiredApplicationVariables', () => {
  it('should keep required variables without a value', () => {
    const result = getMissingRequiredApplicationVariables([
      buildVariable({ key: 'API_KEY', isRequired: true }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['API_KEY']);
  });

  it('should ignore required variables that are filled', () => {
    const result = getMissingRequiredApplicationVariables([
      buildVariable({ key: 'API_KEY', isRequired: true, value: 'secret' }),
    ]);

    expect(result).toEqual([]);
  });

  it('should ignore optional variables without a value', () => {
    const result = getMissingRequiredApplicationVariables([
      buildVariable({ key: 'REGION' }),
    ]);

    expect(result).toEqual([]);
  });

  it('should treat a masked secret as filled', () => {
    const result = getMissingRequiredApplicationVariables([
      buildVariable({ key: 'API_KEY', isRequired: true, value: '********' }),
    ]);

    expect(result).toEqual([]);
  });

  it('should sort missing variables by key', () => {
    const result = getMissingRequiredApplicationVariables([
      buildVariable({ key: 'REGION', isRequired: true }),
      buildVariable({ key: 'API_KEY', isRequired: true }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['API_KEY', 'REGION']);
  });
});

import { getApplicationPreferencesVariablesCompleteness } from '@/settings/app-preferences/utils/getApplicationPreferencesVariablesCompleteness';

const APPLICATION_ID = 'application-id';
const REQUIRED_VARIABLE = {
  key: 'API_KEY',
  label: 'API key',
  value: '',
  isRequired: true,
  isDeprecated: false,
};

describe('getApplicationPreferencesVariablesCompleteness', () => {
  it('keeps missing response or application preferences incomplete', () => {
    for (const applicationPreferences of [
      undefined,
      [],
      [{ applicationId: 'another-application', variables: [] }],
    ]) {
      expect(
        getApplicationPreferencesVariablesCompleteness({
          applicationId: APPLICATION_ID,
          applicationPreferences,
        }),
      ).toEqual({ hasMissingRequiredVariables: true });
    }
  });

  it('accepts an application without variables', () => {
    expect(
      getApplicationPreferencesVariablesCompleteness({
        applicationId: APPLICATION_ID,
        applicationPreferences: [
          { applicationId: APPLICATION_ID, variables: [] },
        ],
      }),
    ).toEqual({ hasMissingRequiredVariables: false });
  });

  it('checks required values for the selected application', () => {
    expect(
      getApplicationPreferencesVariablesCompleteness({
        applicationId: APPLICATION_ID,
        applicationPreferences: [
          { applicationId: 'another-application', variables: [] },
          { applicationId: APPLICATION_ID, variables: [REQUIRED_VARIABLE] },
        ],
      }),
    ).toEqual({ hasMissingRequiredVariables: true });
  });

  it('accepts a masked secret regardless of another application', () => {
    expect(
      getApplicationPreferencesVariablesCompleteness({
        applicationId: APPLICATION_ID,
        applicationPreferences: [
          {
            applicationId: 'another-application',
            variables: [REQUIRED_VARIABLE],
          },
          {
            applicationId: APPLICATION_ID,
            variables: [{ ...REQUIRED_VARIABLE, value: '********' }],
          },
        ],
      }),
    ).toEqual({ hasMissingRequiredVariables: false });
  });

  it('ignores deprecated and optional empty variables', () => {
    expect(
      getApplicationPreferencesVariablesCompleteness({
        applicationId: APPLICATION_ID,
        applicationPreferences: [
          {
            applicationId: APPLICATION_ID,
            variables: [
              { ...REQUIRED_VARIABLE, isDeprecated: true },
              { ...REQUIRED_VARIABLE, key: 'OPTIONAL_KEY', isRequired: false },
            ],
          },
        ],
      }),
    ).toEqual({ hasMissingRequiredVariables: false });
  });
});

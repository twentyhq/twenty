import { getAppPreferenceVariableUpdates } from '@/settings/app-preferences/utils/getAppPreferenceVariableUpdates';

const APPLICATION_VARIABLES = [
  { key: 'BOOLEAN', value: 'false' },
  { key: 'NUMBER', value: '0' },
  { key: 'STRING', value: '' },
  { key: 'SECRET', value: '********' },
  { key: 'DISPLAY', value: 'MRR' },
];

describe('getAppPreferenceVariableUpdates', () => {
  it('does not write unchanged false, zero, empty values, or secret masks', () => {
    expect(
      getAppPreferenceVariableUpdates({
        applicationVariables: APPLICATION_VARIABLES,
        draftValueByKey: {},
      }),
    ).toEqual([]);
    expect(
      getAppPreferenceVariableUpdates({
        applicationVariables: APPLICATION_VARIABLES,
        draftValueByKey: {
          BOOLEAN: 'false',
          NUMBER: '0',
          STRING: '',
          SECRET: '********',
        },
      }),
    ).toEqual([]);
  });

  it('does not submit the secret mask when another preference is saved', () => {
    expect(
      getAppPreferenceVariableUpdates({
        applicationVariables: APPLICATION_VARIABLES,
        draftValueByKey: { DISPLAY: 'ARR' },
      }),
    ).toEqual([{ key: 'DISPLAY', value: 'ARR' }]);
  });

  it('preserves clearing as an explicit empty override', () => {
    expect(
      getAppPreferenceVariableUpdates({
        applicationVariables: APPLICATION_VARIABLES,
        draftValueByKey: { DISPLAY: '', SECRET: '' },
      }),
    ).toEqual([
      { key: 'SECRET', value: '' },
      { key: 'DISPLAY', value: '' },
    ]);
  });

  it('only includes declared preferences when metadata changes', () => {
    expect(
      getAppPreferenceVariableUpdates({
        applicationVariables: APPLICATION_VARIABLES,
        draftValueByKey: { REMOVED_VARIABLE: 'old draft', NUMBER: '3' },
      }),
    ).toEqual([{ key: 'NUMBER', value: '3' }]);
  });
});

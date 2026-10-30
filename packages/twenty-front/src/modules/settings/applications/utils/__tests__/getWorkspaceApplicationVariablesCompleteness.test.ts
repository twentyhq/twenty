import { getWorkspaceApplicationVariablesCompleteness } from '@/settings/applications/utils/getWorkspaceApplicationVariablesCompleteness';
import { ApplicationVariableScope } from '~/generated-metadata/graphql';

const REQUIRED_VARIABLE = {
  key: 'API_KEY',
  label: 'API key',
  value: '',
  isRequired: true,
  isDeprecated: false,
  scope: ApplicationVariableScope.WORKSPACE,
};

describe('getWorkspaceApplicationVariablesCompleteness', () => {
  it('keeps a missing response incomplete', () => {
    expect(getWorkspaceApplicationVariablesCompleteness()).toEqual({
      hasMissingRequiredVariables: true,
    });
  });

  it('accepts an application without variables', () => {
    expect(getWorkspaceApplicationVariablesCompleteness([])).toEqual({
      hasMissingRequiredVariables: false,
    });
  });

  it('blocks an empty required workspace value', () => {
    expect(
      getWorkspaceApplicationVariablesCompleteness([REQUIRED_VARIABLE]),
    ).toEqual({ hasMissingRequiredVariables: true });
  });

  it('accepts a masked required secret', () => {
    expect(
      getWorkspaceApplicationVariablesCompleteness([
        { ...REQUIRED_VARIABLE, value: '********' },
      ]),
    ).toEqual({ hasMissingRequiredVariables: false });
  });

  it('ignores user, deprecated and optional empty variables', () => {
    expect(
      getWorkspaceApplicationVariablesCompleteness([
        { ...REQUIRED_VARIABLE, scope: ApplicationVariableScope.USER },
        { ...REQUIRED_VARIABLE, key: 'OLD_KEY', isDeprecated: true },
        { ...REQUIRED_VARIABLE, key: 'OPTIONAL_KEY', isRequired: false },
      ]),
    ).toEqual({ hasMissingRequiredVariables: false });
  });
});

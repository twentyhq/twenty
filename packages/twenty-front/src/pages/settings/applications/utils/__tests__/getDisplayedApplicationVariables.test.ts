import { ApplicationVariableScope } from '~/generated-metadata/graphql';
import { getDisplayedApplicationVariables } from '~/pages/settings/applications/utils/getDisplayedApplicationVariables';

const buildApplicationVariable = ({
  key,
  value = '',
  isDeprecated = false,
  scope = ApplicationVariableScope.WORKSPACE,
}: {
  key: string;
  value?: string;
  isDeprecated?: boolean;
  scope?: ApplicationVariableScope;
}) => ({ key, value, isDeprecated, scope });

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

  it('should leave out user-scoped variables', () => {
    const result = getDisplayedApplicationVariables([
      buildApplicationVariable({
        key: 'PERSONAL_API_KEY',
        value: 'workspace-default',
        scope: ApplicationVariableScope.USER,
      }),
      buildApplicationVariable({ key: 'WORKSPACE_API_KEY' }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['WORKSPACE_API_KEY']);
  });
});

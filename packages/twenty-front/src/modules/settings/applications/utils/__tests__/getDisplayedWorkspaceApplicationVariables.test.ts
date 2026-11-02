import { getDisplayedWorkspaceApplicationVariables } from '@/settings/applications/utils/getDisplayedWorkspaceApplicationVariables';
import { ApplicationVariableScope } from '~/generated-metadata/graphql';

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

describe('getDisplayedWorkspaceApplicationVariables', () => {
  it('should keep only the displayed workspace variables, sorted by key', () => {
    const result = getDisplayedWorkspaceApplicationVariables([
      buildApplicationVariable({ key: 'ZONE' }),
      buildApplicationVariable({
        key: 'PERSONAL_TOKEN',
        scope: ApplicationVariableScope.USER,
      }),
      buildApplicationVariable({ key: 'LEGACY_KEY', isDeprecated: true }),
      buildApplicationVariable({ key: 'API_KEY' }),
    ]);

    expect(result.map(({ key }) => key)).toEqual(['API_KEY', 'ZONE']);
  });
});

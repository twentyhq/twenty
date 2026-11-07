import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import {
  type ApplicationVariable,
  ApplicationVariableScope,
} from '~/generated-metadata/graphql';

export const getDisplayedWorkspaceApplicationVariables = <
  WorkspaceApplicationVariable extends Pick<
    ApplicationVariable,
    'key' | 'value' | 'isDeprecated' | 'scope'
  >,
>(
  applicationVariables: WorkspaceApplicationVariable[],
): WorkspaceApplicationVariable[] =>
  getDisplayedApplicationVariables(
    applicationVariables.filter(
      (applicationVariable) =>
        applicationVariable.scope === ApplicationVariableScope.WORKSPACE,
    ),
  );

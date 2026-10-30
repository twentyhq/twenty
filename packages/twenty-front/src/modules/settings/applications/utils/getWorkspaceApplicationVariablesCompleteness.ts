import { getDisplayedWorkspaceApplicationVariables } from '@/settings/applications/utils/getDisplayedWorkspaceApplicationVariables';
import { getMissingRequiredApplicationVariables } from '@/settings/applications/utils/getMissingRequiredApplicationVariables';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type ApplicationVariable } from '~/generated-metadata/graphql';

export const getWorkspaceApplicationVariablesCompleteness = (
  applicationVariables?: Pick<
    ApplicationVariable,
    'key' | 'label' | 'value' | 'isRequired' | 'isDeprecated' | 'scope'
  >[],
): { hasMissingRequiredVariables: boolean } => ({
  hasMissingRequiredVariables:
    !isDefined(applicationVariables) ||
    isNonEmptyArray(
      getMissingRequiredApplicationVariables(
        getDisplayedWorkspaceApplicationVariables(applicationVariables),
      ),
    ),
});

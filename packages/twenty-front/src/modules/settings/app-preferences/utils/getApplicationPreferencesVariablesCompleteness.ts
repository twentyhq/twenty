import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import { getMissingRequiredApplicationVariables } from '@/settings/applications/utils/getMissingRequiredApplicationVariables';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type ApplicationPreferences,
  type UserApplicationVariableValue,
} from '~/generated-metadata/graphql';

export const getApplicationPreferencesVariablesCompleteness = ({
  applicationId,
  applicationPreferences,
}: {
  applicationId: string;
  applicationPreferences?: (Pick<ApplicationPreferences, 'applicationId'> & {
    variables: Pick<
      UserApplicationVariableValue,
      'key' | 'label' | 'value' | 'isRequired' | 'isDeprecated'
    >[];
  })[];
}): { hasMissingRequiredVariables: boolean } => {
  const applicationPreference = applicationPreferences?.find(
    (preference) => preference.applicationId === applicationId,
  );

  return {
    hasMissingRequiredVariables:
      !isDefined(applicationPreference) ||
      isNonEmptyArray(
        getMissingRequiredApplicationVariables(
          getDisplayedApplicationVariables(applicationPreference.variables),
        ),
      ),
  };
};

import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { getDisplayedWorkspaceApplicationVariables } from '@/settings/applications/utils/getDisplayedWorkspaceApplicationVariables';
import { getMissingRequiredApplicationVariables } from '@/settings/applications/utils/getMissingRequiredApplicationVariables';
import { hasApplicationUpdate } from '@/settings/applications/utils/hasApplicationUpdate';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  type Application,
  type ApplicationRegistrationSummary,
  type ApplicationVariable,
} from '~/generated-metadata/graphql';

type WorkspaceApplicationStatusApplication = Pick<
  Application,
  'id' | 'version'
> & {
  applicationRegistration?: Pick<
    ApplicationRegistrationSummary,
    'sourceType' | 'latestAvailableVersion'
  > | null;
};

type WorkspaceApplicationStatusApplicationWithVariables = Pick<
  Application,
  'id'
> & {
  applicationVariables: Pick<
    ApplicationVariable,
    'key' | 'label' | 'value' | 'isRequired' | 'isDeprecated' | 'scope'
  >[];
};

export const getWorkspaceApplicationStatusById = ({
  applications,
  applicationsWithVariables,
}: {
  applications: WorkspaceApplicationStatusApplication[];
  applicationsWithVariables?: WorkspaceApplicationStatusApplicationWithVariables[];
}): Record<string, SettingsApplicationStatus> => {
  const applicationVariablesByApplicationId = new Map(
    (applicationsWithVariables ?? []).map(({ id, applicationVariables }) => [
      id,
      applicationVariables,
    ]),
  );

  const statusById: Record<string, SettingsApplicationStatus> = {};

  for (const application of applications) {
    const missingRequiredApplicationVariables =
      getMissingRequiredApplicationVariables(
        getDisplayedWorkspaceApplicationVariables(
          applicationVariablesByApplicationId.get(application.id) ?? [],
        ),
      );

    if (isNonEmptyArray(missingRequiredApplicationVariables)) {
      statusById[application.id] = { type: 'missingConfiguration' };
      continue;
    }

    if (
      hasApplicationUpdate({
        sourceType: application.applicationRegistration?.sourceType,
        currentVersion: application.version,
        latestAvailableVersion:
          application.applicationRegistration?.latestAvailableVersion,
      })
    ) {
      statusById[application.id] = { type: 'updateAvailable' };
    }
  }

  return statusById;
};

import { type SettingsWorkspaceApplicationStatus } from '@/settings/applications/types/SettingsWorkspaceApplicationStatus';
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

export const getWorkspaceApplicationStatusesById = ({
  applications,
  applicationsWithVariables,
}: {
  applications: WorkspaceApplicationStatusApplication[];
  applicationsWithVariables?: WorkspaceApplicationStatusApplicationWithVariables[];
}): Record<string, SettingsWorkspaceApplicationStatus[]> => {
  const applicationVariablesByApplicationId = new Map(
    (applicationsWithVariables ?? []).map(({ id, applicationVariables }) => [
      id,
      applicationVariables,
    ]),
  );

  const statusesById: Record<string, SettingsWorkspaceApplicationStatus[]> = {};

  for (const application of applications) {
    const statuses: SettingsWorkspaceApplicationStatus[] = [];

    const missingRequiredApplicationVariables =
      getMissingRequiredApplicationVariables(
        getDisplayedWorkspaceApplicationVariables(
          applicationVariablesByApplicationId.get(application.id) ?? [],
        ),
      );

    if (isNonEmptyArray(missingRequiredApplicationVariables)) {
      statuses.push({ type: 'missingConfiguration' });
    }

    if (
      hasApplicationUpdate({
        sourceType: application.applicationRegistration?.sourceType,
        currentVersion: application.version,
        latestAvailableVersion:
          application.applicationRegistration?.latestAvailableVersion,
      })
    ) {
      statuses.push({ type: 'updateAvailable' });
    }

    if (isNonEmptyArray(statuses)) {
      statusesById[application.id] = statuses;
    }
  }

  return statusesById;
};

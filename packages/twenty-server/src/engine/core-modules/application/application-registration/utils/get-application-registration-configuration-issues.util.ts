import { ApplicationRegistrationConfigurationIssue } from 'src/engine/core-modules/application/application-registration/enums/application-registration-configuration-issue.enum';

export const getApplicationRegistrationConfigurationIssues = ({
  hasUnfilledRequiredServerVariable,
  exposesServerRoute,
  hasOwnerWorkspace,
  isInstalledOnOwnerWorkspace,
}: {
  hasUnfilledRequiredServerVariable: boolean;
  exposesServerRoute: boolean;
  hasOwnerWorkspace: boolean;
  isInstalledOnOwnerWorkspace: boolean;
}): ApplicationRegistrationConfigurationIssue[] => {
  const configurationIssues: ApplicationRegistrationConfigurationIssue[] = [];

  if (hasUnfilledRequiredServerVariable) {
    configurationIssues.push(
      ApplicationRegistrationConfigurationIssue.MISSING_REQUIRED_SERVER_VARIABLES,
    );
  }

  if (!exposesServerRoute) {
    return configurationIssues;
  }

  if (!hasOwnerWorkspace) {
    configurationIssues.push(
      ApplicationRegistrationConfigurationIssue.MISSING_OWNER_WORKSPACE,
    );
  }

  if (!isInstalledOnOwnerWorkspace) {
    configurationIssues.push(
      ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
    );
  }

  return configurationIssues;
};

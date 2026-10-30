import { ApplicationRegistrationConfigurationIssue } from 'src/engine/core-modules/application/application-registration/enums/application-registration-configuration-issue.enum';
import { getApplicationRegistrationConfigurationIssues } from 'src/engine/core-modules/application/application-registration/utils/get-application-registration-configuration-issues.util';

describe('getApplicationRegistrationConfigurationIssues', () => {
  it('should return no issue for a fully configured app without server route', () => {
    expect(
      getApplicationRegistrationConfigurationIssues({
        hasUnfilledRequiredServerVariable: false,
        exposesServerRoute: false,
        hasOwnerWorkspace: false,
        isInstalledOnOwnerWorkspace: false,
      }),
    ).toEqual([]);
  });

  it('should report missing required server variables', () => {
    expect(
      getApplicationRegistrationConfigurationIssues({
        hasUnfilledRequiredServerVariable: true,
        exposesServerRoute: false,
        hasOwnerWorkspace: true,
        isInstalledOnOwnerWorkspace: true,
      }),
    ).toEqual([
      ApplicationRegistrationConfigurationIssue.MISSING_REQUIRED_SERVER_VARIABLES,
    ]);
  });

  it('should report every step left for an unclaimed server route app', () => {
    expect(
      getApplicationRegistrationConfigurationIssues({
        hasUnfilledRequiredServerVariable: true,
        exposesServerRoute: true,
        hasOwnerWorkspace: false,
        isInstalledOnOwnerWorkspace: false,
      }),
    ).toEqual([
      ApplicationRegistrationConfigurationIssue.MISSING_REQUIRED_SERVER_VARIABLES,
      ApplicationRegistrationConfigurationIssue.MISSING_OWNER_WORKSPACE,
      ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
    ]);
  });

  it('should only report the missing install for an owned server route app', () => {
    expect(
      getApplicationRegistrationConfigurationIssues({
        hasUnfilledRequiredServerVariable: false,
        exposesServerRoute: true,
        hasOwnerWorkspace: true,
        isInstalledOnOwnerWorkspace: false,
      }),
    ).toEqual([
      ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE,
    ]);
  });

  it('should return no issue for a server route app installed on its owner workspace', () => {
    expect(
      getApplicationRegistrationConfigurationIssues({
        hasUnfilledRequiredServerVariable: false,
        exposesServerRoute: true,
        hasOwnerWorkspace: true,
        isInstalledOnOwnerWorkspace: true,
      }),
    ).toEqual([]);
  });
});

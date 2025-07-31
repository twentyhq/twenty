import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';
import { PermissionFlagType } from '~/generated/graphql';

const SettingsApiKeys = lazy(() =>
  import('~/pages/settings/developers/api-keys/SettingsApiKeys').then(
    (module) => ({
      default: module.SettingsApiKeys,
    }),
  ),
);

const SettingsGraphQLPlayground = lazy(() =>
  import(
    '~/pages/settings/developers/playground/SettingsGraphQLPlayground'
  ).then((module) => ({
    default: module.SettingsGraphQLPlayground,
  })),
);

const SettingsRestPlayground = lazy(() =>
  import('~/pages/settings/developers/playground/SettingsRestPlayground').then(
    (module) => ({
      default: module.SettingsRestPlayground,
    }),
  ),
);

const SettingsWebhooks = lazy(() =>
  import(
    '~/pages/settings/developers/webhooks/components/SettingsWebhooks'
  ).then((module) => ({
    default: module.SettingsWebhooks,
  })),
);

const SettingsAccountsCalendars = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccountsCalendars').then(
    (module) => ({
      default: module.SettingsAccountsCalendars,
    }),
  ),
);

const SettingsAccountsEmails = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccountsEmails').then((module) => ({
    default: module.SettingsAccountsEmails,
  })),
);

const SettingsNewAccount = lazy(() =>
  import('~/pages/settings/accounts/SettingsNewAccount').then((module) => ({
    default: module.SettingsNewAccount,
  })),
);

const SettingsNewObject = lazy(() =>
  import('~/pages/settings/data-model/SettingsNewObject').then((module) => ({
    default: module.SettingsNewObject,
  })),
);

const SettingsNewImapSmtpCaldavConnection = lazy(() =>
  import(
    '@/settings/accounts/components/SettingsAccountsNewImapSmtpCaldavConnection'
  ).then((module) => ({
    default: module.SettingsAccountsNewImapSmtpCaldavConnection,
  })),
);

const SettingsEditImapSmtpCaldavConnection = lazy(() =>
  import(
    '@/settings/accounts/components/SettingsAccountsEditImapSmtpCaldavConnection'
  ).then((module) => ({
    default: module.SettingsAccountsEditImapSmtpCaldavConnection,
  })),
);

const SettingsObjectDetailPage = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectDetailPage').then(
    (module) => ({
      default: module.SettingsObjectDetailPage,
    }),
  ),
);

const SettingsObjectOverview = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectOverview').then(
    (module) => ({
      default: module.SettingsObjectOverview,
    }),
  ),
);

const SettingsDevelopersApiKeyDetail = lazy(() =>
  import(
    '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail'
  ).then((module) => ({
    default: module.SettingsDevelopersApiKeyDetail,
  })),
);

const SettingsDevelopersApiKeysNew = lazy(() =>
  import(
    '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeysNew'
  ).then((module) => ({
    default: module.SettingsDevelopersApiKeysNew,
  })),
);

const Releases = lazy(() =>
  import('~/pages/settings/Releases').then((module) => ({
    default: module.Releases,
  })),
);

const SettingsServerlessFunctions = lazy(() =>
  import(
    '~/pages/settings/serverless-functions/SettingsServerlessFunctions'
  ).then((module) => ({ default: module.SettingsServerlessFunctions })),
);

const SettingsServerlessFunctionDetail = lazy(() =>
  import(
    '~/pages/settings/serverless-functions/SettingsServerlessFunctionDetail'
  ).then((module) => ({
    default: module.SettingsServerlessFunctionDetail,
  })),
);

const SettingsServerlessFunctionsNew = lazy(() =>
  import(
    '~/pages/settings/serverless-functions/SettingsServerlessFunctionsNew'
  ).then((module) => ({
    default: module.SettingsServerlessFunctionsNew,
  })),
);

const SettingsWorkspace = lazy(() =>
  import('~/pages/settings/SettingsWorkspace').then((module) => ({
    default: module.SettingsWorkspace,
  })),
);

const SettingsAI = lazy(() =>
  import('~/pages/settings/ai/SettingsAI').then((module) => ({
    default: module.SettingsAI,
  })),
);

const SettingsAgentForm = lazy(() =>
  import('~/pages/settings/ai/SettingsAgentForm').then((module) => ({
    default: module.SettingsAgentForm,
  })),
);

const SettingsDomain = lazy(() =>
  import('~/pages/settings/workspace/SettingsDomain').then((module) => ({
    default: module.SettingsDomain,
  })),
);

const SettingsWorkspaceMembers = lazy(() =>
  import('~/pages/settings/SettingsWorkspaceMembers').then((module) => ({
    default: module.SettingsWorkspaceMembers,
  })),
);

const SettingsProfile = lazy(() =>
  import('~/pages/settings/SettingsProfile').then((module) => ({
    default: module.SettingsProfile,
  })),
);

const SettingsTwoFactorAuthenticationMethod = lazy(() =>
  import('~/pages/settings/SettingsTwoFactorAuthenticationMethod').then(
    (module) => ({
      default: module.SettingsTwoFactorAuthenticationMethod,
    }),
  ),
);

const SettingsExperience = lazy(() =>
  import(
    '~/pages/settings/profile/appearance/components/SettingsExperience'
  ).then((module) => ({
    default: module.SettingsExperience,
  })),
);

const SettingsAccounts = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccounts').then((module) => ({
    default: module.SettingsAccounts,
  })),
);

const SettingsBilling = lazy(() =>
  import('~/pages/settings/SettingsBilling').then((module) => ({
    default: module.SettingsBilling,
  })),
);

const SettingsIntegrations = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrations').then(
    (module) => ({
      default: module.SettingsIntegrations,
    }),
  ),
);

const SettingsObjects = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjects').then((module) => ({
    default: module.SettingsObjects,
  })),
);

const SettingsDevelopersWebhookNew = lazy(() =>
  import(
    '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookNew'
  ).then((module) => ({
    default: module.SettingsDevelopersWebhookNew,
  })),
);

const SettingsDevelopersWebhookDetail = lazy(() =>
  import(
    '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookDetail'
  ).then((module) => ({
    default: module.SettingsDevelopersWebhookDetail,
  })),
);

const SettingsIntegrationDatabase = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrationDatabase').then(
    (module) => ({
      default: module.SettingsIntegrationDatabase,
    }),
  ),
);

const SettingsIntegrationMCP = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrationMCPPage').then(
    (module) => ({
      default: module.SettingsIntegrationMCPPage,
    }),
  ),
);

const SettingsIntegrationNewDatabaseConnection = lazy(() =>
  import(
    '~/pages/settings/integrations/SettingsIntegrationNewDatabaseConnection'
  ).then((module) => ({
    default: module.SettingsIntegrationNewDatabaseConnection,
  })),
);

const SettingsIntegrationEditDatabaseConnection = lazy(() =>
  import(
    '~/pages/settings/integrations/SettingsIntegrationEditDatabaseConnection'
  ).then((module) => ({
    default: module.SettingsIntegrationEditDatabaseConnection,
  })),
);

const SettingsIntegrationShowDatabaseConnection = lazy(() =>
  import(
    '~/pages/settings/integrations/SettingsIntegrationShowDatabaseConnection'
  ).then((module) => ({
    default: module.SettingsIntegrationShowDatabaseConnection,
  })),
);

const SettingsObjectNewFieldSelect = lazy(() =>
  import(
    '~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect'
  ).then((module) => ({
    default: module.SettingsObjectNewFieldSelect,
  })),
);

const SettingsObjectNewFieldConfigure = lazy(() =>
  import(
    '~/pages/settings/data-model/new-field/SettingsObjectNewFieldConfigure'
  ).then((module) => ({
    default: module.SettingsObjectNewFieldConfigure,
  })),
);
const SettingsObjectFieldEdit = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectFieldEdit').then(
    (module) => ({
      default: module.SettingsObjectFieldEdit,
    }),
  ),
);

const SettingsSecurity = lazy(() =>
  import('~/pages/settings/security/SettingsSecurity').then((module) => ({
    default: module.SettingsSecurity,
  })),
);

const SettingsSecuritySSOIdentifyProvider = lazy(() =>
  import('~/pages/settings/security/SettingsSecuritySSOIdentifyProvider').then(
    (module) => ({
      default: module.SettingsSecuritySSOIdentifyProvider,
    }),
  ),
);

const SettingsSecurityApprovedAccessDomain = lazy(() =>
  import('~/pages/settings/security/SettingsSecurityApprovedAccessDomain').then(
    (module) => ({
      default: module.SettingsSecurityApprovedAccessDomain,
    }),
  ),
);

const SettingsAdmin = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdmin').then((module) => ({
    default: module.SettingsAdmin,
  })),
);

const SettingsAdminIndicatorHealthStatus = lazy(() =>
  import(
    '~/pages/settings/admin-panel/SettingsAdminIndicatorHealthStatus'
  ).then((module) => ({
    default: module.SettingsAdminIndicatorHealthStatus,
  })),
);

const SettingsAdminConfigVariableDetails = lazy(() =>
  import(
    '~/pages/settings/admin-panel/SettingsAdminConfigVariableDetails'
  ).then((module) => ({
    default: module.SettingsAdminConfigVariableDetails,
  })),
);

const SettingsLab = lazy(() =>
  import('~/pages/settings/lab/SettingsLab').then((module) => ({
    default: module.SettingsLab,
  })),
);

const SettingsRoles = lazy(() =>
  import('~/pages/settings/roles/SettingsRoles').then((module) => ({
    default: module.SettingsRoles,
  })),
);

const SettingsRoleCreate = lazy(() =>
  import('~/pages/settings/roles/SettingsRoleCreate').then((module) => ({
    default: module.SettingsRoleCreate,
  })),
);

const SettingsRoleEdit = lazy(() =>
  import('~/pages/settings/roles/SettingsRoleEdit').then((module) => ({
    default: module.SettingsRoleEdit,
  })),
);

const SettingsRoleObjectLevel = lazy(() =>
  import('~/pages/settings/roles/SettingsRoleObjectLevel').then((module) => ({
    default: module.SettingsRoleObjectLevel,
  })),
);

const SettingsRoleAddObjectLevel = lazy(() =>
  import('~/pages/settings/roles/SettingsRoleAddObjectLevel').then(
    (module) => ({
      default: module.SettingsRoleAddObjectLevel,
    }),
  ),
);

type SettingsRoutesProps = {
  isFunctionSettingsEnabled?: boolean;
  isAdminPageEnabled?: boolean;
};

export const SettingsRoutes = ({
  isFunctionSettingsEnabled,
  isAdminPageEnabled,
}: SettingsRoutesProps) => (
  <Suspense fallback={<SettingsSkeletonLoader />}>
    <Routes>
      <Route path={SettingsPath.ProfilePage} element={<SettingsProfile />} />
      <Route
        path={SettingsPath.TwoFactorAuthenticationStrategyConfig}
        element={<SettingsTwoFactorAuthenticationMethod />}
      />
      <Route path={SettingsPath.Experience} element={<SettingsExperience />} />
      <Route path={SettingsPath.Accounts} element={<SettingsAccounts />} />
      <Route path={SettingsPath.NewAccount} element={<SettingsNewAccount />} />
      <Route
        path={SettingsPath.AccountsCalendars}
        element={<SettingsAccountsCalendars />}
      />
      <Route
        path={SettingsPath.AccountsEmails}
        element={<SettingsAccountsEmails />}
      />
      <Route
        path={SettingsPath.NewImapSmtpCaldavConnection}
        element={<SettingsNewImapSmtpCaldavConnection />}
      />
      <Route
        path={SettingsPath.EditImapSmtpCaldavConnection}
        element={<SettingsEditImapSmtpCaldavConnection />}
      />
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.WORKSPACE}
          />
        }
      >
        <Route path={SettingsPath.Workspace} element={<SettingsWorkspace />} />
        <Route path={SettingsPath.AI} element={<SettingsAI />} />
        <Route
          path={SettingsPath.AINewAgent}
          element={<SettingsAgentForm mode="create" />}
        />
        <Route
          path={SettingsPath.AIAgentDetail}
          element={<SettingsAgentForm mode="edit" />}
        />
        <Route path={SettingsPath.Billing} element={<SettingsBilling />} />
        <Route path={SettingsPath.Domain} element={<SettingsDomain />} />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.WORKSPACE_MEMBERS}
          />
        }
      >
        <Route
          path={SettingsPath.WorkspaceMembersPage}
          element={<SettingsWorkspaceMembers />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.DATA_MODEL}
          />
        }
      >
        <Route path={SettingsPath.Objects} element={<SettingsObjects />} />
        <Route
          path={SettingsPath.ObjectOverview}
          element={<SettingsObjectOverview />}
        />
        <Route
          path={SettingsPath.ObjectDetail}
          element={<SettingsObjectDetailPage />}
        />
        <Route path={SettingsPath.NewObject} element={<SettingsNewObject />} />
        <Route
          path={SettingsPath.ObjectNewFieldSelect}
          element={<SettingsObjectNewFieldSelect />}
        />
        <Route
          path={SettingsPath.ObjectNewFieldConfigure}
          element={<SettingsObjectNewFieldConfigure />}
        />
        <Route
          path={SettingsPath.ObjectFieldEdit}
          element={<SettingsObjectFieldEdit />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.ROLES}
          />
        }
      >
        <Route path={SettingsPath.Roles} element={<SettingsRoles />} />
        <Route path={SettingsPath.RoleDetail} element={<SettingsRoleEdit />} />
        <Route
          path={SettingsPath.RoleCreate}
          element={<SettingsRoleCreate />}
        />
        <Route
          path={SettingsPath.RoleObjectLevel}
          element={<SettingsRoleObjectLevel />}
        />
        <Route
          path={SettingsPath.RoleAddObjectLevel}
          element={<SettingsRoleAddObjectLevel />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.API_KEYS_AND_WEBHOOKS}
          />
        }
      >
        <Route path={SettingsPath.APIs} element={<SettingsApiKeys />} />
        <Route path={SettingsPath.Webhooks} element={<SettingsWebhooks />} />
        <Route
          path={`${SettingsPath.GraphQLPlayground}`}
          element={<SettingsGraphQLPlayground />}
        />
        <Route
          path={`${SettingsPath.RestPlayground}/*`}
          element={<SettingsRestPlayground />}
        />
        <Route
          path={SettingsPath.NewApiKey}
          element={<SettingsDevelopersApiKeysNew />}
        />
        <Route
          path={SettingsPath.ApiKeyDetail}
          element={<SettingsDevelopersApiKeyDetail />}
        />
        <Route
          path={SettingsPath.NewWebhook}
          element={<SettingsDevelopersWebhookNew />}
        />
        <Route
          path={SettingsPath.WebhookDetail}
          element={<SettingsDevelopersWebhookDetail />}
        />
        <Route
          path={SettingsPath.Integrations}
          element={<SettingsIntegrations />}
        />
        <Route
          path={SettingsPath.IntegrationDatabase}
          element={<SettingsIntegrationDatabase />}
        />
        <Route
          path={SettingsPath.IntegrationNewDatabaseConnection}
          element={<SettingsIntegrationNewDatabaseConnection />}
        />
        <Route
          path={SettingsPath.IntegrationEditDatabaseConnection}
          element={<SettingsIntegrationEditDatabaseConnection />}
        />
        <Route
          path={SettingsPath.IntegrationDatabaseConnection}
          element={<SettingsIntegrationShowDatabaseConnection />}
        />
        <Route
          path={SettingsPath.IntegrationMCP}
          element={<SettingsIntegrationMCP />}
        />
      </Route>
      {isFunctionSettingsEnabled && (
        <>
          <Route
            path={SettingsPath.ServerlessFunctions}
            element={<SettingsServerlessFunctions />}
          />
          <Route
            path={SettingsPath.NewServerlessFunction}
            element={<SettingsServerlessFunctionsNew />}
          />
          <Route
            path={SettingsPath.ServerlessFunctionDetail}
            element={<SettingsServerlessFunctionDetail />}
          />
        </>
      )}
      <Route path={SettingsPath.Releases} element={<Releases />} />
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.SECURITY}
          />
        }
      >
        <Route path={SettingsPath.Security} element={<SettingsSecurity />} />
        <Route
          path={SettingsPath.NewSSOIdentityProvider}
          element={<SettingsSecuritySSOIdentifyProvider />}
        />
        <Route
          path={SettingsPath.NewApprovedAccessDomain}
          element={<SettingsSecurityApprovedAccessDomain />}
        />
      </Route>

      {isAdminPageEnabled && (
        <>
          <Route path={SettingsPath.AdminPanel} element={<SettingsAdmin />} />
          <Route
            path={SettingsPath.AdminPanelIndicatorHealthStatus}
            element={<SettingsAdminIndicatorHealthStatus />}
          />

          <Route
            path={SettingsPath.AdminPanelConfigVariableDetails}
            element={<SettingsAdminConfigVariableDetails />}
          />
        </>
      )}
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.WORKSPACE}
          />
        }
      >
        <Route path={SettingsPath.Lab} element={<SettingsLab />} />
      </Route>
    </Routes>
  </Suspense>
);

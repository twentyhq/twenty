import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPath } from '@/types/SettingsPath';

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

const SettingsDevelopersWebhooksNew = lazy(() =>
  import(
    '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhooksNew'
  ).then((module) => ({
    default: module.SettingsDevelopersWebhooksNew,
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

const SettingsDevelopers = lazy(() =>
  import('~/pages/settings/developers/SettingsDevelopers').then((module) => ({
    default: module.SettingsDevelopers,
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

const SettingsDevelopersWebhooksDetail = lazy(() =>
  import(
    '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookDetail'
  ).then((module) => ({
    default: module.SettingsDevelopersWebhooksDetail,
  })),
);

const SettingsIntegrationDatabase = lazy(() =>
  import('~/pages/settings/integrations/SettingsIntegrationDatabase').then(
    (module) => ({
      default: module.SettingsIntegrationDatabase,
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
    '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldSelect'
  ).then((module) => ({
    default: module.SettingsObjectNewFieldSelect,
  })),
);

const SettingsObjectNewFieldConfigure = lazy(() =>
  import(
    '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldConfigure'
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

const SettingsAdmin = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdmin').then((module) => ({
    default: module.SettingsAdmin,
  })),
);

const SettingsAdminContent = lazy(() =>
  import('@/settings/admin-panel/components/SettingsAdminContent').then(
    (module) => ({
      default: module.SettingsAdminContent,
    }),
  ),
);

type SettingsRoutesProps = {
  isBillingEnabled?: boolean;
  isServerlessFunctionSettingsEnabled?: boolean;
  isAdminPageEnabled?: boolean;
};

export const SettingsRoutes = ({
  isBillingEnabled,
  isServerlessFunctionSettingsEnabled,
  isAdminPageEnabled,
}: SettingsRoutesProps) => (
  <Suspense fallback={<SettingsSkeletonLoader />}>
    <Routes>
      <Route path={SettingsPath.ProfilePage} element={<SettingsProfile />} />
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
      {isBillingEnabled && (
        <Route path={SettingsPath.Billing} element={<SettingsBilling />} />
      )}
      <Route path={SettingsPath.Workspace} element={<SettingsWorkspace />} />
      <Route path={SettingsPath.Domain} element={<SettingsDomain />} />
      <Route
        path={SettingsPath.WorkspaceMembersPage}
        element={<SettingsWorkspaceMembers />}
      />
      <Route path={SettingsPath.Workspace} element={<SettingsWorkspace />} />
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
      <Route path={SettingsPath.Developers} element={<SettingsDevelopers />} />

      <Route
        path={SettingsPath.DevelopersNewApiKey}
        element={<SettingsDevelopersApiKeysNew />}
      />
      <Route
        path={SettingsPath.DevelopersApiKeyDetail}
        element={<SettingsDevelopersApiKeyDetail />}
      />
      <Route
        path={SettingsPath.DevelopersNewWebhook}
        element={<SettingsDevelopersWebhooksNew />}
      />
      <Route
        path={SettingsPath.DevelopersNewWebhookDetail}
        element={<SettingsDevelopersWebhooksDetail />}
      />
      {isServerlessFunctionSettingsEnabled && (
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
      <Route path={SettingsPath.Releases} element={<Releases />} />
      <Route path={SettingsPath.Security} element={<SettingsSecurity />} />
      <Route
        path={SettingsPath.NewSSOIdentityProvider}
        element={<SettingsSecuritySSOIdentifyProvider />}
      />
      {isAdminPageEnabled && (
        <>
          <Route path={SettingsPath.AdminPanel} element={<SettingsAdmin />} />
          <Route
            path={SettingsPath.FeatureFlags}
            element={<SettingsAdminContent />}
          />
        </>
      )}
    </Routes>
  </Suspense>
);

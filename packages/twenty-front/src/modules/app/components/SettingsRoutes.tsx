import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingPublicDomain } from '@/settings/domains/components/SettingPublicDomain';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const SettingsGraphQLPlayground = lazy(() =>
  import('~/pages/settings/developers/playground/SettingsGraphQLPlayground').then(
    (module) => ({
      default: module.SettingsGraphQLPlayground,
    }),
  ),
);

const SettingsRestPlayground = lazy(() =>
  import('~/pages/settings/developers/playground/SettingsRestPlayground').then(
    (module) => ({
      default: module.SettingsRestPlayground,
    }),
  ),
);

const SettingsAccountsConfiguration = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccountsConfiguration').then(
    (module) => ({
      default: module.SettingsAccountsConfiguration,
    }),
  ),
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
  import('@/settings/accounts/components/SettingsAccountsNewImapSmtpCaldavConnection').then(
    (module) => ({
      default: module.SettingsAccountsNewImapSmtpCaldavConnection,
    }),
  ),
);

const SettingsEditImapSmtpCaldavConnection = lazy(() =>
  import('@/settings/accounts/components/SettingsAccountsEditImapSmtpCaldavConnection').then(
    (module) => ({
      default: module.SettingsAccountsEditImapSmtpCaldavConnection,
    }),
  ),
);

const SettingsNewEmailGroupChannel = lazy(() =>
  import('@/settings/accounts/components/SettingsAccountsNewEmailGroupChannel').then(
    (module) => ({
      default: module.SettingsAccountsNewEmailGroupChannel,
    }),
  ),
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
  import('~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail').then(
    (module) => ({
      default: module.SettingsDevelopersApiKeyDetail,
    }),
  ),
);

const SettingsDevelopersApiKeysNew = lazy(() =>
  import('~/pages/settings/developers/api-keys/SettingsDevelopersApiKeysNew').then(
    (module) => ({
      default: module.SettingsDevelopersApiKeysNew,
    }),
  ),
);

const SettingsLogicFunctionDetail = lazy(() =>
  import('~/pages/settings/logic-functions/SettingsLogicFunctionDetail').then(
    (module) => ({
      default: module.SettingsLogicFunctionDetail,
    }),
  ),
);

const SettingsGeneral = lazy(() =>
  import('~/pages/settings/general/SettingsGeneral').then((module) => ({
    default: module.SettingsGeneral,
  })),
);

const SettingsWorkspaceEmail = lazy(() =>
  import('~/pages/settings/email/SettingsWorkspaceEmail').then((module) => ({
    default: module.SettingsWorkspaceEmail,
  })),
);

const SettingsWorkspaceEmailGroupChannelDetail = lazy(() =>
  import('~/pages/settings/email/SettingsWorkspaceEmailGroupChannelDetail').then(
    (module) => ({
      default: module.SettingsWorkspaceEmailGroupChannelDetail,
    }),
  ),
);

const SettingsWorkspaceNewUnsubscribeTopic = lazy(() =>
  import('~/pages/settings/email/SettingsWorkspaceNewUnsubscribeTopic').then(
    (module) => ({
      default: module.SettingsWorkspaceNewUnsubscribeTopic,
    }),
  ),
);

const SettingsWorkspaceUnsubscribeTopicDetail = lazy(() =>
  import('~/pages/settings/email/SettingsWorkspaceUnsubscribeTopicDetail').then(
    (module) => ({
      default: module.SettingsWorkspaceUnsubscribeTopicDetail,
    }),
  ),
);

const SettingsSubdomainPage = lazy(() =>
  import('~/pages/settings/domains/SettingsSubdomainPage').then((module) => ({
    default: module.SettingsSubdomainPage,
  })),
);

const SettingsCustomDomainPage = lazy(() =>
  import('~/pages/settings/domains/SettingsCustomDomainPage').then(
    (module) => ({
      default: module.SettingsCustomDomainPage,
    }),
  ),
);

const SettingsApiWebhooks = lazy(() =>
  import('~/pages/settings/api-webhooks/SettingsApiWebhooks').then(
    (module) => ({
      default: module.SettingsApiWebhooks,
    }),
  ),
);

const SettingsAI = lazy(() =>
  import('~/pages/settings/ai/SettingsAI').then((module) => ({
    default: module.SettingsAI,
  })),
);

const SettingsAiUsageUserDetail = lazy(() =>
  import('~/pages/settings/ai/SettingsAiUsageUserDetail').then((module) => ({
    default: module.SettingsAiUsageUserDetail,
  })),
);

const SettingsToolDetail = lazy(() =>
  import('~/pages/settings/ai/SettingsToolDetail').then((module) => ({
    default: module.SettingsToolDetail,
  })),
);

const SettingsApplications = lazy(() =>
  import('~/pages/settings/applications/SettingsApplications').then(
    (module) => ({
      default: module.SettingsApplications,
    }),
  ),
);

const SettingsApplicationDetails = lazy(() =>
  import('~/pages/settings/applications/SettingsApplicationDetails').then(
    (module) => ({
      default: module.SettingsApplicationDetails,
    }),
  ),
);

const SettingsApplicationConnectionDetail = lazy(() =>
  import('~/pages/settings/applications/SettingsApplicationConnectionDetail').then(
    (module) => ({
      default: module.SettingsApplicationConnectionDetail,
    }),
  ),
);

const SettingsApplicationFrontComponentDetail = lazy(() =>
  import('~/pages/settings/applications/SettingsApplicationFrontComponentDetail').then(
    (module) => ({
      default: module.SettingsApplicationFrontComponentDetail,
    }),
  ),
);

const SettingsApplicationCommandMenuItemDetail = lazy(() =>
  import('~/pages/settings/applications/SettingsApplicationCommandMenuItemDetail').then(
    (module) => ({
      default: module.SettingsApplicationCommandMenuItemDetail,
    }),
  ),
);

const SettingsLayout = lazy(() =>
  import('~/pages/settings/layout/SettingsLayout').then((module) => ({
    default: module.SettingsLayout,
  })),
);

const SettingsLayoutViewDetail = lazy(() =>
  import('~/pages/settings/layout/SettingsLayoutViewDetail').then((module) => ({
    default: module.SettingsLayoutViewDetail,
  })),
);

const SettingsLayoutPageLayoutDetail = lazy(() =>
  import('~/pages/settings/layout/SettingsLayoutPageLayoutDetail').then(
    (module) => ({
      default: module.SettingsLayoutPageLayoutDetail,
    }),
  ),
);

const SettingsAdminApplicationRegistrationDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDetail').then(
    (module) => ({
      default: module.SettingsAdminApplicationRegistrationDetail,
    }),
  ),
);

const SettingsAdminApplicationRegistrationConfigVariableDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationConfigVariableDetail').then(
    (module) => ({
      default: module.SettingsAdminApplicationRegistrationConfigVariableDetail,
    }),
  ),
);

const SettingsAvailableApplicationDetails = lazy(() =>
  import('~/pages/settings/applications/SettingsAvailableApplicationDetails').then(
    (module) => ({
      default: module.SettingsAvailableApplicationDetails,
    }),
  ),
);

const SettingsApplicationRegistrationDetails = lazy(() =>
  import('~/pages/settings/applications/SettingsApplicationRegistrationDetails').then(
    (module) => ({
      default: module.SettingsApplicationRegistrationDetails,
    }),
  ),
);

const SettingsApplicationRegistrationConfigVariableDetail = lazy(() =>
  import('~/pages/settings/applications/components/SettingsApplicationRegistrationConfigVariableDetail').then(
    (module) => ({
      default: module.SettingsApplicationRegistrationConfigVariableDetail,
    }),
  ),
);

const SettingsAgentForm = lazy(() =>
  import('~/pages/settings/ai/SettingsAgentForm').then((module) => ({
    default: module.SettingsAgentForm,
  })),
);

const SettingsAgentTurnDetail = lazy(() =>
  import('~/pages/settings/ai/SettingsAgentTurnDetail').then((module) => ({
    default: module.SettingsAgentTurnDetail,
  })),
);

const SettingsSkillForm = lazy(() =>
  import('~/pages/settings/ai/SettingsSkillForm').then((module) => ({
    default: module.SettingsSkillForm,
  })),
);

const SettingsAiPrompts = lazy(() =>
  import('~/pages/settings/ai/SettingsAiPrompts').then((module) => ({
    default: module.SettingsAiPrompts,
  })),
);

const SettingsWorkspaceMembers = lazy(() =>
  import('~/pages/settings/members/SettingsWorkspaceMembers').then(
    (module) => ({
      default: module.SettingsWorkspaceMembers,
    }),
  ),
);

const SettingsWorkspaceMember = lazy(() =>
  import('~/pages/settings/members/SettingsWorkspaceMember').then((module) => ({
    default: module.SettingsWorkspaceMember,
  })),
);

const SettingsProfile = lazy(() =>
  import('~/pages/settings/profile/SettingsProfile').then((module) => ({
    default: module.SettingsProfile,
  })),
);

const SettingsTwoFactorAuthenticationMethod = lazy(() =>
  import('~/pages/settings/profile/SettingsTwoFactorAuthenticationMethod').then(
    (module) => ({
      default: module.SettingsTwoFactorAuthenticationMethod,
    }),
  ),
);

const SettingsExperience = lazy(() =>
  import('~/pages/settings/profile/appearance/components/SettingsExperience').then(
    (module) => ({
      default: module.SettingsExperience,
    }),
  ),
);

const SettingsAccounts = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccounts').then((module) => ({
    default: module.SettingsAccounts,
  })),
);

const SettingsAccountsEmails = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccountsEmails').then((module) => ({
    default: module.SettingsAccountsEmails,
  })),
);

const SettingsAccountsCalendars = lazy(() =>
  import('~/pages/settings/accounts/SettingsAccountsCalendars').then(
    (module) => ({
      default: module.SettingsAccountsCalendars,
    }),
  ),
);

const SettingsBilling = lazy(() =>
  import('~/pages/settings/billing/SettingsBilling').then((module) => ({
    default: module.SettingsBilling,
  })),
);

const SettingsUsage = lazy(() =>
  import('~/pages/settings/billing/SettingsUsage').then((module) => ({
    default: module.SettingsUsage,
  })),
);

const SettingsUsageUserDetail = lazy(() =>
  import('~/pages/settings/billing/SettingsUsageUserDetail').then((module) => ({
    default: module.SettingsUsageUserDetail,
  })),
);

const SettingsObjects = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjects').then((module) => ({
    default: module.SettingsObjects,
  })),
);

const SettingsDevelopersWebhookNew = lazy(() =>
  import('~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookNew').then(
    (module) => ({
      default: module.SettingsDevelopersWebhookNew,
    }),
  ),
);

const SettingsDevelopersWebhookDetail = lazy(() =>
  import('~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookDetail').then(
    (module) => ({
      default: module.SettingsDevelopersWebhookDetail,
    }),
  ),
);

const SettingsObjectNewFieldSelect = lazy(() =>
  import('~/pages/settings/data-model/new-field/SettingsObjectNewFieldSelect').then(
    (module) => ({
      default: module.SettingsObjectNewFieldSelect,
    }),
  ),
);

const SettingsObjectNewFieldConfigure = lazy(() =>
  import('~/pages/settings/data-model/new-field/SettingsObjectNewFieldConfigure').then(
    (module) => ({
      default: module.SettingsObjectNewFieldConfigure,
    }),
  ),
);

const SettingsObjectNewIndex = lazy(() =>
  import('~/pages/settings/data-model/new-index/SettingsObjectNewIndex').then(
    (module) => ({
      default: module.SettingsObjectNewIndex,
    }),
  ),
);
const SettingsObjectFieldEdit = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectFieldEdit').then(
    (module) => ({
      default: module.SettingsObjectFieldEdit,
    }),
  ),
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
  import('~/pages/settings/admin-panel/SettingsAdminIndicatorHealthStatus').then(
    (module) => ({
      default: module.SettingsAdminIndicatorHealthStatus,
    }),
  ),
);

const SettingsAdminInferredVersion = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminInferredVersion').then(
    (module) => ({
      default: module.SettingsAdminInferredVersion,
    }),
  ),
);

const SettingsAdminInstanceStatus = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminInstanceStatus').then(
    (module) => ({
      default: module.SettingsAdminInstanceStatus,
    }),
  ),
);

const SettingsAdminWorkspacesStatus = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminWorkspacesStatus').then(
    (module) => ({
      default: module.SettingsAdminWorkspacesStatus,
    }),
  ),
);

const SettingsAdminQueueDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminQueueDetail').then(
    (module) => ({
      default: module.SettingsAdminQueueDetail,
    }),
  ),
);

const SettingsAdminConfigVariableDetails = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminConfigVariableDetails').then(
    (module) => ({
      default: module.SettingsAdminConfigVariableDetails,
    }),
  ),
);

const SettingsAdminNewAiProvider = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminNewAiProvider').then(
    (module) => ({
      default: module.SettingsAdminNewAiProvider,
    }),
  ),
);

const SettingsAdminAiProviderDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminAiProviderDetail').then(
    (module) => ({
      default: module.SettingsAdminAiProviderDetail,
    }),
  ),
);

const SettingsAdminNewAiModel = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminNewAiModel').then(
    (module) => ({
      default: module.SettingsAdminNewAiModel,
    }),
  ),
);

const SettingsAdminUserDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminUserDetail').then(
    (module) => ({
      default: module.SettingsAdminUserDetail,
    }),
  ),
);

const SettingsAdminWorkspaceDetail = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminWorkspaceDetail').then(
    (module) => ({
      default: module.SettingsAdminWorkspaceDetail,
    }),
  ),
);

const SettingsAdminWorkspaceChatThread = lazy(() =>
  import('~/pages/settings/admin-panel/SettingsAdminWorkspaceChatThread').then(
    (module) => ({
      default: module.SettingsAdminWorkspaceChatThread,
    }),
  ),
);

const SettingsCommunity = lazy(() =>
  import('~/pages/settings/community/SettingsCommunity').then((module) => ({
    default: module.SettingsCommunity,
  })),
);

const SettingsRoleCreate = lazy(() =>
  import('~/pages/settings/members/roles/SettingsRoleCreate').then(
    (module) => ({
      default: module.SettingsRoleCreate,
    }),
  ),
);

const SettingsRoleEdit = lazy(() =>
  import('~/pages/settings/members/roles/SettingsRoleEdit').then((module) => ({
    default: module.SettingsRoleEdit,
  })),
);

const SettingsRoleObjectLevel = lazy(() =>
  import('~/pages/settings/members/roles/SettingsRoleObjectLevel').then(
    (module) => ({
      default: module.SettingsRoleObjectLevel,
    }),
  ),
);

const SettingsRoleAddObjectLevel = lazy(() =>
  import('~/pages/settings/members/roles/SettingsRoleAddObjectLevel').then(
    (module) => ({
      default: module.SettingsRoleAddObjectLevel,
    }),
  ),
);

type SettingsRoutesProps = {
  isFunctionSettingsEnabled?: boolean;
  isAdminPageEnabled?: boolean;
};

export const SettingsRoutes = ({ isAdminPageEnabled }: SettingsRoutesProps) => (
  <Suspense fallback={<SettingsSkeletonLoader />}>
    <Routes>
      <Route path={SettingsPath.ProfilePage} element={<SettingsProfile />} />
      <Route
        path={SettingsPath.TwoFactorAuthenticationStrategyConfig}
        element={<SettingsTwoFactorAuthenticationMethod />}
      />
      <Route path={SettingsPath.Experience} element={<SettingsExperience />} />
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.CONNECTED_ACCOUNTS}
          />
        }
      >
        <Route path={SettingsPath.Accounts} element={<SettingsAccounts />} />
        <Route
          path={SettingsPath.AccountsEmails}
          element={<SettingsAccountsEmails />}
        />
        <Route
          path={SettingsPath.AccountsCalendars}
          element={<SettingsAccountsCalendars />}
        />
        <Route
          path={SettingsPath.NewAccount}
          element={<SettingsNewAccount />}
        />
        <Route
          path={SettingsPath.AccountsConfiguration}
          element={<SettingsAccountsConfiguration />}
        />
        <Route
          path={SettingsPath.NewImapSmtpCaldavConnection}
          element={<SettingsNewImapSmtpCaldavConnection />}
        />
        <Route
          path={SettingsPath.EditImapSmtpCaldavConnection}
          element={<SettingsEditImapSmtpCaldavConnection />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.WORKSPACE}
          />
        }
      >
        <Route path={SettingsPath.General} element={<SettingsGeneral />} />
        <Route
          path={SettingsPath.WorkspaceEmail}
          element={<SettingsWorkspaceEmail />}
        />
        <Route
          path={SettingsPath.NewEmailGroupChannel}
          element={<SettingsNewEmailGroupChannel />}
        />
        <Route
          path={SettingsPath.EmailGroupChannelDetail}
          element={<SettingsWorkspaceEmailGroupChannelDetail />}
        />
        <Route
          path={SettingsPath.NewUnsubscribeTopic}
          element={<SettingsWorkspaceNewUnsubscribeTopic />}
        />
        <Route
          path={SettingsPath.UnsubscribeTopicDetail}
          element={<SettingsWorkspaceUnsubscribeTopicDetail />}
        />
        <Route path={SettingsPath.Billing} element={<SettingsBilling />} />
        <Route path={SettingsPath.Usage} element={<SettingsUsage />} />
        <Route
          path={SettingsPath.UsageUserDetail}
          element={<SettingsUsageUserDetail />}
        />
        <Route
          path={SettingsPath.Subdomain}
          element={<SettingsSubdomainPage />}
        />
        <Route
          path={SettingsPath.CustomDomain}
          element={<SettingsCustomDomainPage />}
        />
        <Route
          path={SettingsPath.PublicDomain}
          element={<SettingPublicDomain />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.AI_SETTINGS}
          />
        }
      >
        <Route path={SettingsPath.AI} element={<SettingsAI />} />
        <Route path={SettingsPath.AiPrompts} element={<SettingsAiPrompts />} />
        <Route
          path={SettingsPath.AiNewAgent}
          element={<SettingsAgentForm mode="create" />}
        />
        <Route
          path={SettingsPath.AiAgentDetail}
          element={<SettingsAgentForm mode="edit" />}
        />
        <Route
          path={SettingsPath.AiAgentTurnDetail}
          element={<SettingsAgentTurnDetail />}
        />
        <Route
          path={SettingsPath.AiNewSkill}
          element={<SettingsSkillForm mode="create" />}
        />
        <Route
          path={SettingsPath.AiSkillDetail}
          element={<SettingsSkillForm mode="edit" />}
        />
        <Route
          path={SettingsPath.AiUsageUserDetail}
          element={<SettingsAiUsageUserDetail />}
        />
        <Route
          path={SettingsPath.AiToolDetail}
          element={<SettingsToolDetail />}
        />
        <Route
          path={SettingsPath.LogicFunctionDetail}
          element={<SettingsLogicFunctionDetail />}
        />
      </Route>
      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.LAYOUTS}
          />
        }
      >
        <Route path={SettingsPath.Layout} element={<SettingsLayout />} />
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
        <Route
          path={SettingsPath.WorkspaceMemberPage}
          element={<SettingsWorkspaceMember />}
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
          path={SettingsPath.ObjectNewIndex}
          element={<SettingsObjectNewIndex />}
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
        <Route
          path={SettingsPath.Roles}
          element={
            <Navigate
              to={`/settings/${SettingsPath.WorkspaceMembersPage}#roles`}
              replace
            />
          }
        />
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
        <Route
          path={SettingsPath.ApiWebhooks}
          element={<SettingsApiWebhooks />}
        />
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
      </Route>

      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.APPLICATIONS}
          />
        }
      >
        <Route
          path={SettingsPath.Applications}
          element={<SettingsApplications />}
        />
        <Route
          path={SettingsPath.ApplicationDetail}
          element={<SettingsApplicationDetails />}
        />
        <Route
          path={SettingsPath.ApplicationConnectionDetail}
          element={<SettingsApplicationConnectionDetail />}
        />
        <Route
          path={SettingsPath.AvailableApplicationDetail}
          element={<SettingsAvailableApplicationDetails />}
        />
        <Route
          path={SettingsPath.ApplicationRegistrationDetail}
          element={<SettingsApplicationRegistrationDetails />}
        />
        <Route
          path={SettingsPath.ApplicationLogicFunctionDetail}
          element={<SettingsLogicFunctionDetail />}
        />
        <Route
          path={SettingsPath.ApplicationFrontComponentDetail}
          element={<SettingsApplicationFrontComponentDetail />}
        />
        <Route
          path={SettingsPath.ApplicationCommandMenuItemDetail}
          element={<SettingsApplicationCommandMenuItemDetail />}
        />
        <Route
          path={SettingsPath.ApplicationViewDetail}
          element={<SettingsLayoutViewDetail />}
        />
        <Route
          path={SettingsPath.ApplicationPageLayoutDetail}
          element={<SettingsLayoutPageLayoutDetail />}
        />
        <Route
          path={SettingsPath.ApplicationRegistrationConfigVariableDetails}
          element={<SettingsApplicationRegistrationConfigVariableDetail />}
        />
      </Route>

      <Route
        path="security"
        element={
          <Navigate to={getSettingsPath(SettingsPath.Security)} replace />
        }
      />

      <Route
        element={
          <SettingsProtectedRouteWrapper
            settingsPermission={PermissionFlagType.SECURITY}
          />
        }
      >
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
            path={SettingsPath.Enterprise}
            element={
              <Navigate
                to={getSettingsPath(SettingsPath.AdminPanelEnterprise)}
                replace
              />
            }
          />
          <Route
            path={SettingsPath.AdminPanelInferredVersion}
            element={<SettingsAdminInferredVersion />}
          />
          <Route
            path={SettingsPath.AdminPanelInstanceStatus}
            element={<SettingsAdminInstanceStatus />}
          />
          <Route
            path={SettingsPath.AdminPanelWorkspacesStatus}
            element={<SettingsAdminWorkspacesStatus />}
          />
          <Route
            path={SettingsPath.AdminPanelIndicatorHealthStatus}
            element={<SettingsAdminIndicatorHealthStatus />}
          />
          <Route
            path={SettingsPath.AdminPanelQueueDetail}
            element={<SettingsAdminQueueDetail />}
          />

          <Route
            path={SettingsPath.AdminPanelConfigVariableDetails}
            element={<SettingsAdminConfigVariableDetails />}
          />
          <Route
            path={SettingsPath.AdminPanelNewAiProvider}
            element={<SettingsAdminNewAiProvider />}
          />
          <Route
            path={SettingsPath.AdminPanelNewAiModel}
            element={<SettingsAdminNewAiModel />}
          />
          <Route
            path={SettingsPath.AdminPanelAiProviderDetail}
            element={<SettingsAdminAiProviderDetail />}
          />
          <Route
            path={SettingsPath.AdminPanelUserDetail}
            element={<SettingsAdminUserDetail />}
          />
          <Route
            path={SettingsPath.AdminPanelWorkspaceDetail}
            element={<SettingsAdminWorkspaceDetail />}
          />
          <Route
            path={SettingsPath.AdminPanelApplicationRegistrationDetail}
            element={<SettingsAdminApplicationRegistrationDetail />}
          />
          <Route
            path={
              SettingsPath.AdminPanelApplicationRegistrationConfigVariableDetails
            }
            element={
              <SettingsAdminApplicationRegistrationConfigVariableDetail />
            }
          />
          <Route
            path={SettingsPath.AdminPanelWorkspaceChatThread}
            element={<SettingsAdminWorkspaceChatThread />}
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
        <Route path={SettingsPath.Community} element={<SettingsCommunity />} />
      </Route>
    </Routes>
  </Suspense>
);

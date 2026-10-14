import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID } from '@/settings/admin-panel/apps/constants/ClaimApplicationRegistrationOwnershipModalId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Link, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  ApplicationRegistrationConfigurationIssue,
  FindAdminApplicationRegistrationClaimsDocument,
  FindAdminApplicationRegistrationVariablesDocument,
  type FindOneAdminApplicationRegistrationQuery,
} from '~/generated-admin/graphql';

type AdminApplicationRegistration = Pick<
  FindOneAdminApplicationRegistrationQuery['findOneAdminApplicationRegistration'],
  'id' | 'universalIdentifier' | 'ownerWorkspaceId' | 'configurationIssues'
>;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const MissingRequiredServerVariablesBanner = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => {
  const { t } = useLingui();
  const location = useLocation();
  const apolloAdminClient = useApolloAdminClient();

  const { data } = useQuery(FindAdminApplicationRegistrationVariablesDocument, {
    client: apolloAdminClient,
    variables: { applicationRegistrationId },
  });

  const missingVariableKeys = (
    data?.findAdminApplicationRegistrationVariables ?? []
  )
    .filter((variable) => variable.isRequired && !variable.isFilled)
    .map((variable) => variable.key)
    .join(', ');

  return (
    <InlineBanner
      status="error"
      action={
        <InlineBanner.Action
          href={`${location.pathname}${location.search}#config`}
          nativeButton={false}
          role="link"
          render={
            <Link
              to={{ search: location.search, hash: '#config' }}
              state={location.state}
            />
          }
        >{t`Configure`}</InlineBanner.Action>
      }
    >
      {isNonEmptyString(missingVariableKeys)
        ? t`Set the required server variables: ${missingVariableKeys}`
        : t`Set the required server variables`}
    </InlineBanner>
  );
};

const MissingOwnerWorkspaceBanner = () => {
  const { t } = useLingui();
  const { openDialog } = useDialog();

  return (
    <InlineBanner
      status="error"
      action={
        <InlineBanner.Action
          onClick={() =>
            openDialog(CLAIM_APPLICATION_REGISTRATION_OWNERSHIP_MODAL_ID)
          }
        >{t`Claim`}</InlineBanner.Action>
      }
    >{t`Claim this app: apps exposing a server route need an owner workspace`}</InlineBanner>
  );
};

const NotInstalledOnOwnerWorkspaceBanner = ({
  registration,
}: {
  registration: AdminApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const ownerWorkspaceId = registration.ownerWorkspaceId;

  const isOwnedByCurrentWorkspace =
    isDefined(ownerWorkspaceId) && ownerWorkspaceId === currentWorkspace?.id;

  const { data } = useQuery(FindAdminApplicationRegistrationClaimsDocument, {
    client: apolloAdminClient,
    variables: { applicationRegistrationId: registration.id },
    skip: !isDefined(ownerWorkspaceId) || isOwnedByCurrentWorkspace,
  });

  if (!isDefined(ownerWorkspaceId)) {
    return (
      <InlineBanner status="error">
        {t`Once claimed, install this app on its owner workspace to enable its server routes`}
      </InlineBanner>
    );
  }

  if (isOwnedByCurrentWorkspace) {
    const installPath = getSettingsPath(
      SettingsPath.AvailableApplicationDetail,
      { availableApplicationId: registration.universalIdentifier },
    );

    return (
      <InlineBanner
        status="error"
        action={
          <InlineBanner.Action
            href={installPath}
            nativeButton={false}
            role="link"
            render={<Link to={installPath} />}
          >{t`Install`}</InlineBanner.Action>
        }
      >{t`Install this app on this workspace, its owner, to enable its server routes`}</InlineBanner>
    );
  }

  const ownerWorkspaceDisplayName =
    data?.findAdminApplicationRegistrationClaims.find(
      (claim) => claim.workspaceId === ownerWorkspaceId,
    )?.workspaceDisplayName ?? ownerWorkspaceId;

  const ownerWorkspacePath = getSettingsPath(
    SettingsPath.AdminPanelWorkspaceDetail,
    { workspaceId: ownerWorkspaceId },
  );

  return (
    <InlineBanner
      status="error"
      action={
        <InlineBanner.Action
          href={ownerWorkspacePath}
          nativeButton={false}
          role="link"
          render={<Link to={ownerWorkspacePath} />}
        >{t`View workspace`}</InlineBanner.Action>
      }
    >{t`Install this app on its owner workspace ${ownerWorkspaceDisplayName} to enable its server routes`}</InlineBanner>
  );
};

export const SettingsAdminApplicationRegistrationConfigurationIssues = ({
  registration,
}: {
  registration: AdminApplicationRegistration;
}) => {
  if (registration.configurationIssues.length === 0) {
    return null;
  }

  return (
    <StyledContainer>
      {registration.configurationIssues.map((configurationIssue) => {
        switch (configurationIssue) {
          case ApplicationRegistrationConfigurationIssue.MISSING_REQUIRED_SERVER_VARIABLES:
            return (
              <MissingRequiredServerVariablesBanner
                key={configurationIssue}
                applicationRegistrationId={registration.id}
              />
            );
          case ApplicationRegistrationConfigurationIssue.MISSING_OWNER_WORKSPACE:
            return <MissingOwnerWorkspaceBanner key={configurationIssue} />;
          case ApplicationRegistrationConfigurationIssue.NOT_INSTALLED_ON_OWNER_WORKSPACE:
            return (
              <NotInstalledOnOwnerWorkspaceBanner
                key={configurationIssue}
                registration={registration}
              />
            );
        }
      })}
    </StyledContainer>
  );
};

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { getUpgradeHealthStatusBadge } from '@/settings/admin-panel/utils/getUpgradeHealthStatusBadge';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { formatUpgradeCommandName, getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconAlertTriangle,
  IconCalendar,
  IconProgressCheck,
  IconStatusChange,
  Status,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  GetInstanceAndAllWorkspacesUpgradeStatusDocument,
  RefreshUpgradeStatusDocument,
} from '~/generated-admin/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const StyledRefreshButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledCommandValue = styled.span`
  word-break: break-word;
`;

export const SettingsAdminInstanceStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const {
    data,
    refetch,
    loading: isLoadingUpgradeStatus,
  } = useQuery(GetInstanceAndAllWorkspacesUpgradeStatusDocument, {
    client: apolloAdminClient,
    fetchPolicy: 'network-only',
  });
  const [refreshUpgradeStatus, { loading: isRefreshingUpgradeStatus }] =
    useMutation(RefreshUpgradeStatusDocument, {
      client: apolloAdminClient,
    });

  const instanceUpgradeStatus =
    data?.getInstanceAndAllWorkspacesUpgradeStatus.instanceUpgradeStatus;
  const instanceHealth = instanceUpgradeStatus?.health;
  const instanceLatestCommand = instanceUpgradeStatus?.latestCommand;

  const instanceHealthBadge = getUpgradeHealthStatusBadge(instanceHealth);

  const formattedInstanceLastUpdated = formatDateTimeString({
    value: instanceLatestCommand?.createdAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  const handleRefreshUpgradeStatus = async () => {
    try {
      await refreshUpgradeStatus();
      await refetch();
      enqueueSuccessSnackBar({
        message: t`Upgrade status refreshed`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to refresh upgrade status`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Health`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        {
          children: t`Instance status`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Instance status`}
            description={t`Health of the latest instance command`}
          />
          <SettingsTableCard
            items={[
              {
                Icon: IconProgressCheck,
                label: t`Status`,
                value: (
                  <Status
                    color={instanceHealthBadge.color}
                    text={instanceHealthBadge.label}
                    weight="medium"
                  />
                ),
              },
              {
                Icon: IconCalendar,
                label: t`Last command`,
                value: (
                  <StyledCommandValue>
                    {instanceLatestCommand?.name
                      ? formatUpgradeCommandName(instanceLatestCommand.name)
                      : t`None`}
                  </StyledCommandValue>
                ),
              },
              {
                Icon: IconStatusChange,
                label: t`Last command result`,
                value: instanceLatestCommand?.status
                  ? instanceLatestCommand.status === 'completed'
                    ? t`Completed`
                    : t`Failed`
                  : t`N/A`,
              },
              {
                Icon: IconCalendar,
                label: t`Last updated`,
                value: isNonEmptyString(formattedInstanceLastUpdated)
                  ? formattedInstanceLastUpdated
                  : t`N/A`,
              },
              ...(instanceLatestCommand?.errorMessage
                ? [
                    {
                      Icon: IconAlertTriangle,
                      label: t`Last error`,
                      value: instanceLatestCommand.errorMessage,
                    },
                  ]
                : []),
            ]}
            gridAutoColumns="3fr 4fr"
          />
          <StyledRefreshButtonContainer>
            <Button
              variant="secondary"
              title={t`Refresh status`}
              onClick={handleRefreshUpgradeStatus}
              disabled={isRefreshingUpgradeStatus || isLoadingUpgradeStatus}
            />
          </StyledRefreshButtonContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

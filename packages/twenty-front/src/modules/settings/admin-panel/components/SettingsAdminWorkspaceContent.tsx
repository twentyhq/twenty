import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { getUpgradeHealthStatusBadge } from '@/settings/admin-panel/utils/getUpgradeHealthStatusBadge';
import { getWorkspaceSchemaName } from '@/settings/admin-panel/utils/getWorkspaceSchemaName';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import {
  formatUpgradeCommandName,
  getImageAbsoluteURI,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import { type GetUpgradeStatusQuery } from '~/generated-admin/graphql';
import { AvatarOrIcon, LinkChip } from 'twenty-ui/components';
import {
  H2Title,
  IconCalendar,
  IconHome,
  IconId,
  IconLink,
  IconStatusChange,
  IconUser,
  OverflowingTextWithTooltip,
  Status,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

type SettingsAdminWorkspaceContentProps = {
  activeWorkspace: WorkspaceInfo | undefined;
  workspaceUpgradeStatus?: GetUpgradeStatusQuery['getUpgradeStatus'][number];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

export const SettingsAdminWorkspaceContent = ({
  activeWorkspace,
  workspaceUpgradeStatus,
}: SettingsAdminWorkspaceContentProps) => {
  const { t } = useLingui();
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const formattedLastUpdated = formatDateTimeString({
    value: workspaceUpgradeStatus?.latestCommand?.createdAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog: localeCatalog,
  });

  const getWorkspaceUrl = (workspaceUrls: WorkspaceInfo['workspaceUrls']) => {
    return workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl;
  };

  const upgradeHealthStatusBadge = getUpgradeHealthStatusBadge(
    workspaceUpgradeStatus?.health,
  );

  const workspaceInfoItems = [
    {
      Icon: IconHome,
      label: t`Name`,
      value: activeWorkspace?.id ? (
        <LinkChip
          label={activeWorkspace?.name ?? ''}
          emptyLabel={t`Untitled`}
          to={getSettingsPath(SettingsPath.AdminPanelWorkspaceDetail, {
            workspaceId: activeWorkspace.id,
          })}
          leftComponent={
            <AvatarOrIcon
              avatarUrl={
                getImageAbsoluteURI({
                  imageUrl: isNonEmptyString(activeWorkspace?.logo)
                    ? activeWorkspace?.logo
                    : DEFAULT_WORKSPACE_LOGO,
                  baseUrl: REACT_APP_SERVER_BASE_URL,
                }) ?? ''
              }
            />
          }
        />
      ) : (
        (activeWorkspace?.name ?? '')
      ),
    },
    {
      Icon: IconId,
      label: t`ID`,
      value: activeWorkspace?.id,
    },
    {
      Icon: IconId,
      label: t`Schema name`,
      value: isDefined(activeWorkspace?.id)
        ? getWorkspaceSchemaName(activeWorkspace.id)
        : '',
    },
    {
      Icon: IconLink,
      label: t`URL`,
      value: activeWorkspace?.workspaceUrls
        ? getWorkspaceUrl(activeWorkspace.workspaceUrls)
        : '',
    },
    {
      Icon: IconUser,
      label: t`Members`,
      value: activeWorkspace?.totalUsers,
    },
    {
      Icon: IconStatusChange,
      label: t`Status`,
      value: activeWorkspace?.activationStatus,
    },
    {
      Icon: IconCalendar,
      label: t`Created`,
      value: activeWorkspace?.createdAt
        ? new Date(activeWorkspace.createdAt).toLocaleDateString()
        : '',
    },
  ];

  if (!activeWorkspace) return null;

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Workspace Info`}
          description={t`About this workspace`}
        />
        <SettingsTableCard
          items={workspaceInfoItems}
          gridAutoColumns="1fr 4fr"
        />
      </Section>
      {workspaceUpgradeStatus && (
        <Section>
          <H2Title
            title={t`Upgrade Status`}
            description={t`Workspace upgrade health`}
          />
          <SettingsTableCard
            items={[
              {
                Icon: IconStatusChange,
                label: t`Status`,
                value: (
                  <Status
                    color={upgradeHealthStatusBadge.color}
                    text={upgradeHealthStatusBadge.label}
                    weight="medium"
                  />
                ),
              },
              {
                Icon: IconId,
                label: t`Inferred version`,
                value: workspaceUpgradeStatus.inferredVersion ?? t`Unknown`,
              },
              {
                Icon: IconCalendar,
                label: t`Last command`,
                value: (
                  <OverflowingTextWithTooltip
                    text={
                      workspaceUpgradeStatus.latestCommand?.name
                        ? formatUpgradeCommandName(
                            workspaceUpgradeStatus.latestCommand.name,
                          )
                        : t`None`
                    }
                  />
                ),
              },
              {
                Icon: IconCalendar,
                label: t`Last updated`,
                value: isNonEmptyString(formattedLastUpdated)
                  ? formattedLastUpdated
                  : t`N/A`,
              },
              {
                Icon: IconStatusChange,
                label: t`Last command result`,
                value: workspaceUpgradeStatus.latestCommand?.status
                  ? workspaceUpgradeStatus.latestCommand.status === 'completed'
                    ? t`Completed`
                    : t`Failed`
                  : t`N/A`,
              },
              ...(workspaceUpgradeStatus.latestCommand?.errorMessage
                ? [
                    {
                      Icon: IconStatusChange,
                      label: t`Last error`,
                      value: workspaceUpgradeStatus.latestCommand.errorMessage,
                    },
                  ]
                : []),
            ]}
            gridAutoColumns="2fr 3fr"
          />
        </Section>
      )}
    </StyledContainer>
  );
};

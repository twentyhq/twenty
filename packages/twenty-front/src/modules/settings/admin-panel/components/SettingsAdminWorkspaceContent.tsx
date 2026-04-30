import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { getWorkspaceSchemaName } from '@/settings/admin-panel/utils/getWorkspaceSchemaName';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import {
  getImageAbsoluteURI,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import { AvatarOrIcon, LinkChip } from 'twenty-ui/components';
import {
  H2Title,
  IconCalendar,
  IconHome,
  IconId,
  IconLink,
  IconStatusChange,
  IconUser,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SettingsAdminWorkspaceContentProps = {
  activeWorkspace: WorkspaceInfo | undefined;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

export const SettingsAdminWorkspaceContent = ({
  activeWorkspace,
}: SettingsAdminWorkspaceContentProps) => {
  const { t } = useLingui();

  const getWorkspaceUrl = (workspaceUrls: WorkspaceInfo['workspaceUrls']) => {
    return workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl;
  };

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
    </StyledContainer>
  );
};

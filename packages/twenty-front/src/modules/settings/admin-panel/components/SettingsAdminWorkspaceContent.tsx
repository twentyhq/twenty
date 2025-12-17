import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { useFeatureFlagState } from '@/settings/admin-panel/hooks/useFeatureFlagState';
import { useImpersonationAuth } from '@/settings/admin-panel/hooks/useImpersonationAuth';
import { useImpersonationRedirect } from '@/settings/admin-panel/hooks/useImpersonationRedirect';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { getWorkspaceSchemaName } from '@/settings/admin-panel/utils/get-workspace-schema-name.util';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { AvatarChip, Chip } from 'twenty-ui/components';
import {
  H2Title,
  IconEyeShare,
  IconHome,
  IconId,
  IconLink,
  IconUser,
} from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  type FeatureFlagKey,
  useImpersonateMutation,
  useUpdateWorkspaceFeatureFlagMutation,
} from '~/generated-metadata/graphql';

type SettingsAdminWorkspaceContentProps = {
  activeWorkspace: WorkspaceInfo | undefined;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsAdminWorkspaceContent = ({
  activeWorkspace,
}: SettingsAdminWorkspaceContentProps) => {
  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentUser] = useRecoilState(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation();
  const [isImpersonateLoading, setIsImpersonationLoading] = useState(false);
  const { executeImpersonationAuth } = useImpersonationAuth();
  const { executeImpersonationRedirect } = useImpersonationRedirect();
  const [impersonate] = useImpersonateMutation();

  const { updateFeatureFlagState } = useFeatureFlagState();
  const userLookupResult = useRecoilValue(userLookupResultState);

  const { t } = useLingui();

  const handleImpersonate = async (workspaceId: string) => {
    if (!userLookupResult?.user.id) {
      enqueueErrorSnackBar({ message: t`Please search for a user first` });
      return;
    }

    setIsImpersonationLoading(true);

    await impersonate({
      variables: { userId: userLookupResult.user.id, workspaceId },
      onCompleted: async (data) => {
        const { loginToken, workspace } = data.impersonate;
        const isCurrentWorkspace = workspace.id === currentWorkspace?.id;
        if (isCurrentWorkspace) {
          await executeImpersonationAuth(loginToken.token);
          return;
        }

        return executeImpersonationRedirect(
          workspace.workspaceUrls,
          loginToken.token,
          '_blank',
        );
      },
      onError: (error) => {
        const errorMessage = error.message;
        enqueueErrorSnackBar({
          message: t`Failed to impersonate user. ${errorMessage}`,
        });
      },
    }).finally(() => {
      setIsImpersonationLoading(false);
    });
  };

  const handleFeatureFlagUpdate = async (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    const previousValue = userLookupResult?.workspaces
      .find((workspace) => workspace.id === workspaceId)
      ?.featureFlags.find((flag) => flag.key === featureFlag)?.value;

    updateFeatureFlagState(workspaceId, featureFlag, value);
    await updateFeatureFlag({
      variables: {
        workspaceId,
        featureFlag,
        value,
      },

      onError: (error) => {
        if (isDefined(previousValue)) {
          updateFeatureFlagState(workspaceId, featureFlag, previousValue);
        }
        const errorMessage = error.message;
        enqueueErrorSnackBar({
          message: t`Failed to update feature flag. ${errorMessage}`,
        });
      },
    });
  };

  const getWorkspaceUrl = (workspaceUrls: WorkspaceInfo['workspaceUrls']) => {
    return workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl;
  };

  const workspaceInfoItems = [
    {
      Icon: IconHome,
      label: t`Name`,
      value: (
        <Chip
          label={activeWorkspace?.name ?? ''}
          emptyLabel={t`Untitled`}
          leftComponent={
            <AvatarChip
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
  ];

  if (!activeWorkspace) return null;

  return (
    <StyledContainer>
      <Section>
        <H2Title
          title={t`Workspace Info`}
          description={t`About this workspace`}
        />
        <SettingsAdminTableCard
          items={workspaceInfoItems}
          gridAutoColumns="1fr 4fr"
        />
        <StyledButtonContainer>
          {currentUser?.canImpersonate && (
            <Button
              Icon={IconEyeShare}
              variant="primary"
              accent="default"
              title={
                activeWorkspace.allowImpersonation === false
                  ? t`Impersonation is disabled for this workspace`
                  : t`Impersonate`
              }
              onClick={() => handleImpersonate(activeWorkspace.id)}
              disabled={
                isImpersonateLoading ||
                activeWorkspace.allowImpersonation === false
              }
              dataTestId="impersonate-button"
            />
          )}
        </StyledButtonContainer>
      </Section>
      {canManageFeatureFlags && (
        <Table>
          <TableBody>
            <TableRow
              gridAutoColumns="1fr 100px"
              mobileGridAutoColumns="1fr 80px"
            >
              <TableHeader>{t`Feature Flag`}</TableHeader>
              <TableHeader align="right">{t`Status`}</TableHeader>
            </TableRow>

            {activeWorkspace.featureFlags.map((flag) => (
              <TableRow
                gridAutoColumns="1fr 100px"
                mobileGridAutoColumns="1fr 80px"
                key={flag.key}
              >
                <TableCell>{flag.key}</TableCell>
                <TableCell align="right">
                  <Toggle
                    value={flag.value}
                    onChange={(newValue) =>
                      handleFeatureFlagUpdate(
                        activeWorkspace.id,
                        flag.key,
                        newValue,
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </StyledContainer>
  );
};

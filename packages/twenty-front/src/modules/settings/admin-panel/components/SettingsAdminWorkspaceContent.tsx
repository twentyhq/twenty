import { Button, H2Title, IconUser, Toggle } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { useFeatureFlagMutation } from '@/settings/admin-panel/hooks/useFeatureFlagMutation';
import { useFeatureFlagState } from '@/settings/admin-panel/hooks/useFeatureFlagState';
import { useImpersonationAuth } from '@/settings/admin-panel/hooks/useImpersonationAuth';
import { useImpersonationMutation } from '@/settings/admin-panel/hooks/useImpersonationMutation';
import { useImpersonationRedirect } from '@/settings/admin-panel/hooks/useImpersonationRedirect';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated/graphql';

type SettingsAdminWorkspaceContentProps = {
  activeWorkspace: WorkspaceInfo | undefined;
  userId: string;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsAdminWorkspaceContent = ({
  activeWorkspace,
  userId,
}: SettingsAdminWorkspaceContentProps) => {
  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);
  const [isImpersonateLoading, setIsImpersonationLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();
  const [currentUser] = useRecoilState(currentUserState);

  const { executeImpersonationMutation } = useImpersonationMutation();
  const { executeImpersonationAuth } = useImpersonationAuth();
  const { executeImpersonationRedirect } = useImpersonationRedirect();
  const { executeFeatureFlagMutation } = useFeatureFlagMutation();
  const { updateFeatureFlagState } = useFeatureFlagState();
  const userLookupResult = useRecoilValue(userLookupResultState);

  const handleImpersonate = async (userId: string, workspaceId: string) => {
    if (!userId.trim()) {
      enqueueSnackBar('Please enter a user ID', {
        variant: SnackBarVariant.Error,
      });
      return;
    }

    setIsImpersonationLoading(true);

    try {
      const { loginToken, workspace, isCurrentWorkspace } =
        await executeImpersonationMutation(userId, workspaceId);

      if (isCurrentWorkspace) {
        await executeImpersonationAuth(loginToken.token);
        return;
      }

      return executeImpersonationRedirect(
        workspace.workspaceUrls,
        loginToken.token,
      );
    } catch (error) {
      enqueueSnackBar('Failed to impersonate user. Please try again.', {
        variant: SnackBarVariant.Error,
      });
    } finally {
      setIsImpersonationLoading(false);
    }
  };

  const handleFeatureFlagUpdate = async (
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    value: boolean,
  ) => {
    const previousState = userLookupResult;

    try {
      updateFeatureFlagState(workspaceId, featureFlag, value);
      await executeFeatureFlagMutation(workspaceId, featureFlag, value);
    } catch (error) {
      if (isDefined(previousState)) {
        updateFeatureFlagState(workspaceId, featureFlag, !value);
      }
      enqueueSnackBar('Failed to update feature flag. Please try again.', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  if (!activeWorkspace) return null;

  return (
    <>
      <H2Title title={activeWorkspace.name} description={'Workspace Name'} />
      <H2Title
        title={`${activeWorkspace.totalUsers} ${
          activeWorkspace.totalUsers > 1 ? 'Users' : 'User'
        }`}
        description={'Total Users'}
      />
      {currentUser?.canImpersonate && (
        <Button
          Icon={IconUser}
          variant="primary"
          accent="blue"
          title={'Impersonate'}
          onClick={() => handleImpersonate(userId, activeWorkspace.id)}
          disabled={
            isImpersonateLoading || activeWorkspace.allowImpersonation === false
          }
          dataTestId="impersonate-button"
        />
      )}

      {canManageFeatureFlags && (
        <StyledTable>
          <TableRow
            gridAutoColumns="1fr 100px"
            mobileGridAutoColumns="1fr 80px"
          >
            <TableHeader>Feature Flag</TableHeader>
            <TableHeader align="right">Status</TableHeader>
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
        </StyledTable>
      )}
    </>
  );
};

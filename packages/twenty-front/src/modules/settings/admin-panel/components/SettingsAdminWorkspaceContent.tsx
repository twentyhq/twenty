import { Button, H2Title, IconUser, Toggle } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { useFeatureFlagState } from '@/settings/admin-panel/hooks/useFeatureFlagState';
import { useImpersonate } from '@/settings/admin-panel/hooks/useImpersonate';
import { userLookupResultState } from '@/settings/admin-panel/states/userLookupResultState';
import { WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  FeatureFlagKey,
  useUpdateWorkspaceFeatureFlagMutation,
} from '~/generated/graphql';

type SettingsAdminWorkspaceContentProps = {
  activeWorkspace: WorkspaceInfo | undefined;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsAdminWorkspaceContent = ({
  activeWorkspace,
}: SettingsAdminWorkspaceContentProps) => {
  const canManageFeatureFlags = useRecoilValue(canManageFeatureFlagsState);
  const { enqueueSnackBar } = useSnackBar();
  const [currentUser] = useRecoilState(currentUserState);

  const [updateFeatureFlag] = useUpdateWorkspaceFeatureFlagMutation();

  const { updateFeatureFlagState } = useFeatureFlagState();
  const userLookupResult = useRecoilValue(userLookupResultState);

  const { handleImpersonate, isImpersonateLoading } = useImpersonate();

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
        enqueueSnackBar(`Failed to update feature flag. ${error.message}`, {
          variant: SnackBarVariant.Error,
        });
      },
    });
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
          onClick={() =>
            userLookupResult?.user.id &&
            handleImpersonate(userLookupResult?.user.id, activeWorkspace.id)
          }
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

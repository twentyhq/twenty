import { Button, H2Title, IconUser, Toggle } from 'twenty-ui';

import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { useFeatureFlag } from '@/settings/admin-panel/hooks/useFeatureFlag';
import { useImpersonate } from '@/settings/admin-panel/hooks/useImpersonate';
import { WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

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

  const {
    handleImpersonate,
    isLoading: isImpersonateLoading,
    canImpersonate,
  } = useImpersonate();

  const { handleFeatureFlagUpdate } = useFeatureFlag();

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
      {canImpersonate && (
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

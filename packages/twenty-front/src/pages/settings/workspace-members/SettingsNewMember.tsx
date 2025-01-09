import styled from '@emotion/styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { H2Title, IconButton, IconMail, IconReload, IconTrash, isDefined, Status } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { Radio } from '@/ui/input/components/Radio';
import { RadioGroup } from '@/ui/input/components/RadioGroup';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { isNonEmptyArray } from '@sniptt/guards';
// import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
// import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import { formatDistanceToNow } from 'date-fns';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useGetWorkspaceInvitationsQuery } from '~/generated/graphql';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

  span {
    color: ${({ theme }) => theme.font.color.light};
    font-size: ${({ theme }) => theme.font.size.xs};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

export const SettingsNewMember = () => {
  const { t } = useTranslation();
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();

  const [selectedRole, setSelectedRole] = useState('');
  // const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { roles } = useFindAllRoles();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);
  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);

  useGetWorkspaceInvitationsQuery({
      onError: (error: Error) => {
      enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
      });
      },
      onCompleted: (data) => {
      setWorkspaceInvitations(data?.findWorkspaceInvitations ?? []);
      },
  });

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
  const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.errors)) {
      enqueueSnackBar('Error deleting invitation', {
        variant: SnackBarVariant.Error,
          duration: 2000,
      });
     }
  };
  
    const handleResendWorkspaceInvitation = async (appTokenId: string) => {
      const result = await resendInvitation({ appTokenId });
      if (isDefined(result.errors)) {
        enqueueSnackBar('Error resending invitation', {
          variant: SnackBarVariant.Error,
          duration: 2000,
        });
      }
    };
  
    const getExpiresAtText = (expiresAt: string) => {
      const expiresAtDate = new Date(expiresAt);
      return expiresAtDate < new Date()
        ? 'Expired'
        : formatDistanceToNow(new Date(expiresAt));
    };

  return (
    <SubMenuTopBarContainer 
        title=""  
        links={[
            {
              children: t('members'),
              href: getSettingsPagePath(SettingsPath.WorkspaceMembersPage),
            },
            { children: t('addMembersToWorkspace') },
        ]}>
      <SettingsPageContainer>
        <Section>
          <H2Title title={t('assignRole')} />
          <RadioGroup
            onValueChange={(value) => setSelectedRole(value)}
            value={selectedRole}
          >
            {roles?.map((role) => (
              <StyledRadioContainer key={role.id}>
                <Radio
                  name="assignRole"
                  label={role.name}
                  value={role.id.toString()}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <span>{role.description}</span>
              </StyledRadioContainer>
            ))}
          </RadioGroup>
        </Section>
        {selectedRole &&
        <Section>
          <H2Title
            title="Invite by email"
            description="Send an invite email to your team"
          />
            <WorkspaceInviteTeam roleId={selectedRole} />
          {isNonEmptyArray(workspaceInvitations) && (
            <Table>
              <StyledTableHeaderRow>
                <TableRow
                  gridAutoColumns="150px 1fr 1fr"
                  mobileGridAutoColumns="100px 1fr 1fr"
                >
                  <TableHeader>Email</TableHeader>
                  <TableHeader align={'right'}>Expires in</TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </StyledTableHeaderRow>
              {workspaceInvitations?.map((workspaceInvitation) => (
                <StyledTable key={workspaceInvitation.id}>
                  <TableRow
                    gridAutoColumns="150px 1fr 1fr"
                    mobileGridAutoColumns="100px 1fr 1fr"
                  >
                    <TableCell>
                      <StyledIconWrapper>
                        <IconMail
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledIconWrapper>
                      <StyledTextContainerWithEllipsis>
                        {workspaceInvitation.email}
                      </StyledTextContainerWithEllipsis>
                    </TableCell>
                    <TableCell align={'right'}>
                      <Status
                        color={'gray'}
                        text={getExpiresAtText(workspaceInvitation.expiresAt)}
                      />
                    </TableCell>
                    <TableCell align={'right'}>
                      <StyledButtonContainer>
                        <IconButton
                          onClick={() => {
                            handleResendWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="tertiary"
                          size="medium"
                          Icon={IconReload}
                        />
                        <IconButton
                          onClick={() => {
                            handleRemoveWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="tertiary"
                          size="medium"
                          Icon={IconTrash}
                        />
                      </StyledButtonContainer>
                    </TableCell>
                  </TableRow>
                </StyledTable>
              ))}
            </Table>
          )}
        </Section>}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

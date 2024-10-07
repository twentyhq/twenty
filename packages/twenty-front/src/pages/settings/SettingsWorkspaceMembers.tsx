import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  H2Title,
  IconTrash,
  IconUsers,
  IconReload,
  IconMail,
  StyledText,
  Avatar,
} from 'twenty-ui';
import { isNonEmptyArray } from '@sniptt/guards';
import { useTheme } from '@emotion/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { useGetWorkspaceInvitationsQuery } from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';
import { TableRow } from '../../modules/ui/layout/table/components/TableRow';
import { TableCell } from '../../modules/ui/layout/table/components/TableCell';
import { Status } from '../../modules/ui/display/status/components/Status';
import { formatDistanceToNow } from 'date-fns';
import { useResendWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { isDefined } from '~/utils/isDefined';
import { useDeleteWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useDeleteWorkspaceInvitation';

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

export const SettingsWorkspaceMembers = () => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [workspaceMemberToDelete, setWorkspaceMemberToDelete] = useState<
    string | undefined
  >();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { deleteOneRecord: deleteOneWorkspaceMember } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const handleRemoveWorkspaceMember = async (workspaceMemberId: string) => {
    await deleteOneWorkspaceMember?.(workspaceMemberId);
    setIsConfirmationModalOpen(false);
  };

  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

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
      Icon={IconUsers}
      title="Members"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Members' },
      ]}
    >
      <SettingsPageContainer>
        {currentWorkspace?.inviteHash && (
          <Section>
            <H2Title
              title="Invite by link"
              description="Share this link to invite users to join your workspace"
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${currentWorkspace?.inviteHash}`}
            />
          </Section>
        )}
        <Section>
          <H2Title
            title="Members"
            description="Manage the members of your space here"
          />
          <Table>
            <StyledTableHeaderRow>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader align={'right'}></TableHeader>
              </TableRow>
            </StyledTableHeaderRow>
            {workspaceMembers?.map((workspaceMember) => (
              <StyledTable key={workspaceMember.id}>
                <TableRow>
                  <TableCell>
                    <StyledText
                      PrefixComponent={
                        <Avatar
                          avatarUrl={workspaceMember.avatarUrl}
                          placeholderColorSeed={workspaceMember.id}
                          placeholder={workspaceMember.name.firstName ?? ''}
                          type="rounded"
                          size="sm"
                        />
                      }
                      text={
                        workspaceMember.name.firstName +
                        ' ' +
                        workspaceMember.name.lastName
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <StyledText
                      text={workspaceMember.userEmail}
                      color={theme.font.color.secondary}
                    />
                  </TableCell>
                  <TableCell align={'right'}>
                    {currentWorkspaceMember?.id !== workspaceMember.id && (
                      <StyledButtonContainer>
                        <IconButton
                          onClick={() => {
                            setIsConfirmationModalOpen(true);
                            setWorkspaceMemberToDelete(workspaceMember.id);
                          }}
                          variant="tertiary"
                          size="medium"
                          Icon={IconTrash}
                        />
                      </StyledButtonContainer>
                    )}
                  </TableCell>
                </TableRow>
              </StyledTable>
            ))}
          </Table>
        </Section>
        <Section>
          <H2Title
            title="Invite by email"
            description="Send an invite email to your team"
          />
          <WorkspaceInviteTeam />
          {isNonEmptyArray(workspaceInvitations) && (
            <Table>
              <StyledTableHeaderRow>
                <TableRow gridAutoColumns={`1fr 1fr ${theme.spacing(22)}`}>
                  <TableHeader>Email</TableHeader>
                  <TableHeader align={'right'}>Expires in</TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </StyledTableHeaderRow>
              {workspaceInvitations?.map((workspaceInvitation) => (
                <StyledTable key={workspaceInvitation.id}>
                  <TableRow gridAutoColumns={`1fr 1fr ${theme.spacing(22)}`}>
                    <TableCell>
                      <StyledText
                        PrefixComponent={
                          <IconMail
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                          />
                        }
                        text={workspaceInvitation.email}
                      />
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
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        setIsOpen={setIsConfirmationModalOpen}
        title="Account Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete this user
            and remove them from all their assignements.
          </>
        }
        onConfirmClick={() =>
          workspaceMemberToDelete &&
          handleRemoveWorkspaceMember(workspaceMemberToDelete)
        }
        deleteButtonText="Delete account"
      />
    </SubMenuTopBarContainer>
  );
};

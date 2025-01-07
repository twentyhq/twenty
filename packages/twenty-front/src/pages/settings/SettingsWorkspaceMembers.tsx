import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  AppTooltip,
  Avatar,
  H2Title,
  IconButton,
  IconMail,
  IconReload,
  IconTrash,
  Radio,
  RadioGroup,
  Section,
  Status,
  TooltipDelay,
} from 'twenty-ui';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useGetWorkspaceInvitationsQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { TableCell } from '../../modules/ui/layout/table/components/TableCell';
import { TableRow } from '../../modules/ui/layout/table/components/TableRow';
import { useDeleteWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';

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

export const SettingsWorkspaceMembers = () => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [workspaceMemberToDelete, setWorkspaceMemberToDelete] = useState<
    string | undefined
  >();

  const { t } = useTranslation();
  const { roles } = useFindAllRoles();
  const [selectedRole, setSelectedRole] = useState('');

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
        <Section>
          <H2Title
            title="Manage Members"
            description="Manage the members of your space here"
          />
          <Table>
            <StyledTableHeaderRow>
              <TableRow
                gridAutoColumns="150px 1fr 1fr"
                mobileGridAutoColumns="100px 1fr 1fr"
              >
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader align={'right'}></TableHeader>
              </TableRow>
            </StyledTableHeaderRow>
            {workspaceMembers?.map((workspaceMember) => (
              <StyledTable key={workspaceMember.id}>
                <TableRow
                  gridAutoColumns="150px 1fr 1fr"
                  mobileGridAutoColumns="100px 1fr 1fr"
                >
                  <TableCell>
                    <StyledIconWrapper>
                      <Avatar
                        avatarUrl={workspaceMember.avatarUrl}
                        placeholderColorSeed={workspaceMember.id}
                        placeholder={workspaceMember.name.firstName ?? ''}
                        type="rounded"
                        size="sm"
                      />
                    </StyledIconWrapper>
                    <StyledTextContainerWithEllipsis
                      id={`hover-text-${workspaceMember.id}`}
                    >
                      {workspaceMember.name.firstName +
                        ' ' +
                        workspaceMember.name.lastName}
                    </StyledTextContainerWithEllipsis>
                    <AppTooltip
                      anchorSelect={`#hover-text-${workspaceMember.id}`}
                      content={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
                      noArrow
                      place="top"
                      positionStrategy="fixed"
                      delay={TooltipDelay.shortDelay}
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextContainerWithEllipsis>
                      {workspaceMember.userEmail}
                    </StyledTextContainerWithEllipsis>
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

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { CoreObjectNameSingular, SettingsPath } from 'twenty-shared/types';
import {
  generateILikeFiltersForCompositeFields,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import {
  AppTooltip,
  Avatar,
  H2Title,
  IconChevronRight,
  IconMail,
  IconReload,
  IconSearch,
  IconTrash,
  Status,
  TooltipDelay,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useQuery } from '@apollo/client/react';
import { GetWorkspaceInvitationsDocument } from '~/generated-metadata/graphql';

import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledExpiresInHeader = styled.span`
  white-space: nowrap;
`;

const StyledTableContainer = styled.div<{ hasMoreRows?: boolean }>`
  > div {
    border-bottom: ${({ hasMoreRows }) =>
      hasMoreRows
        ? 'none'
        : `1px solid ${themeCssVariables.border.color.light}`};
  }
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  input {
    background: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledChevronWrapper = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

export const SettingsWorkspaceMembers = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigateSettings = useNavigateSettings();
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const [debouncedSearchFilter] = useDebounce(searchFilter, 300);
  const roles = useSettingsAllRoles();

  const rolesById = new Map<string, (typeof roles)[number]>();
  roles.forEach((role) => {
    rolesById.set(role.id, role);
  });

  const searchServerFilter = useMemo(() => {
    if (!debouncedSearchFilter?.trim()) return undefined;

    const normalizedSearchTerm = normalizeSearchText(debouncedSearchFilter);
    const nameFilters = generateILikeFiltersForCompositeFields(
      normalizedSearchTerm,
      'name',
      ['firstName', 'lastName'],
    );

    return {
      or: [
        ...nameFilters,
        { userEmail: { ilike: `%${normalizedSearchTerm}%` } },
      ],
    };
  }, [debouncedSearchFilter]);

  const {
    records: workspaceMembers,
    fetchMoreRecords,
    hasNextPage,
    loading,
  } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    filter: searchServerFilter,
  });

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceInvitations = useAtomStateValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  const { data: invitationsData, error: invitationsError } = useQuery(
    GetWorkspaceInvitationsDocument,
  );

  useSnackBarOnQueryError(invitationsError);

  useEffect(() => {
    if (invitationsData) {
      setWorkspaceInvitations(invitationsData?.findWorkspaceInvitations ?? []);
    }
  }, [invitationsData, setWorkspaceInvitations]);

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
    const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error deleting invitation`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const handleResendWorkspaceInvitation = async (appTokenId: string) => {
    const result = await resendInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error resending invitation`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const { ref: fetchMoreRef } = useInView({
    onChange: async (inView) => {
      if (inView && hasNextPage && !loading && !isFetchingMore) {
        setIsFetchingMore(true);
        await fetchMoreRecords();
        setIsFetchingMore(false);
      }
    },
    delay: 100,
    rootMargin: '1000px',
    threshold: 0,
  });

  const getExpiresAtText = (expiresAt: string) => {
    const msLeft = new Date(expiresAt).getTime() - Date.now();

    if (msLeft <= 0) return t`Expired`;

    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    if (daysLeft === 1) return t`1 day`;

    return t`${daysLeft} days`;
  };

  const optimizedWorkspaceMembers = useMemo(() => {
    if (!searchFilter.trim()) {
      return workspaceMembers;
    }

    const normalizedSearchTerm = normalizeSearchText(searchFilter);
    const searchTerms = normalizedSearchTerm.split(/\s+/);

    return workspaceMembers.filter((member) => {
      const firstName = normalizeSearchText(member.name.firstName);
      const lastName = normalizeSearchText(member.name.lastName);
      const email = normalizeSearchText(member.userEmail);
      const fullName = `${firstName} ${lastName}`.trim();

      return searchTerms.every(
        (term) =>
          firstName.includes(term) ||
          lastName.includes(term) ||
          fullName.includes(term) ||
          email.includes(term),
      );
    });
  }, [workspaceMembers, searchFilter]);

  return (
    <>
      <SettingsRolesQueryEffect />
      <SubMenuTopBarContainer
        title={t`Members`}
        links={[
          {
            children: <Trans>Workspace</Trans>,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          { children: <Trans>Members</Trans> },
        ]}
      >
        <SettingsPageContainer>
          {currentWorkspace?.inviteHash &&
            currentWorkspace?.isPublicInviteLinkEnabled && (
              <Section>
                <H2Title
                  title={t`Invite by link`}
                  description={t`Share this link to invite users to join your workspace`}
                />
                <WorkspaceInviteLink
                  inviteLink={`${window.location.origin}/invite/${currentWorkspace?.inviteHash}`}
                />
              </Section>
            )}
          <Section>
            <H2Title
              title={t`Invite by email`}
              description={t`Send an invite email to your team`}
            />
            <WorkspaceInviteTeam roles={roles} />
            {isNonEmptyArray(workspaceInvitations) && (
              <StyledTableContainer>
                <Table>
                  <TableRow
                    gridAutoColumns="2fr 1fr 1fr 80px"
                    mobileGridAutoColumns="2fr 1fr 1fr 72px"
                  >
                    <TableHeader>
                      <Trans>Email</Trans>
                    </TableHeader>
                    <TableHeader>
                      <Trans>Role</Trans>
                    </TableHeader>
                    <TableHeader align="center">
                      <StyledExpiresInHeader>
                        <Trans>Expires in</Trans>
                      </StyledExpiresInHeader>
                    </TableHeader>
                    <TableHeader></TableHeader>
                  </TableRow>
                  <StyledTableRows>
                    {workspaceInvitations?.map((workspaceInvitation) => (
                      <TableRow
                        gridAutoColumns="2fr 1fr 1fr 80px"
                        mobileGridAutoColumns="2fr 1fr 1fr 72px"
                        key={workspaceInvitation.id}
                      >
                        <TableCell minWidth="0" overflow="hidden">
                          <StyledIconWrapper>
                            <IconMail
                              size={theme.icon.size.md}
                              stroke={theme.icon.stroke.sm}
                            />
                          </StyledIconWrapper>
                          <StyledTextContainerWithEllipsis
                            id={`invitation-email-${workspaceInvitation.id}`}
                          >
                            {workspaceInvitation.email}
                          </StyledTextContainerWithEllipsis>
                          <AppTooltip
                            anchorSelect={`#invitation-email-${workspaceInvitation.id}`}
                            content={workspaceInvitation.email}
                            noArrow
                            place="top"
                            positionStrategy="fixed"
                            delay={TooltipDelay.shortDelay}
                          />
                        </TableCell>
                        <TableCell minWidth="0" overflow="hidden">
                          <StyledTextContainerWithEllipsis>
                            {rolesById.get(workspaceInvitation.roleId ?? '')
                              ?.label ?? t`Default role`}
                          </StyledTextContainerWithEllipsis>
                        </TableCell>
                        <TableCell align="center">
                          <Status
                            color="gray"
                            text={getExpiresAtText(
                              workspaceInvitation.expiresAt,
                            )}
                          />
                        </TableCell>
                        <TableCell align="right">
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
                    ))}
                  </StyledTableRows>
                </Table>
              </StyledTableContainer>
            )}
          </Section>
          <Section>
            <H2Title
              title={t`Manage Members`}
              description={t`Manage the members of your workspace here`}
            />
            <StyledSearchContainer>
              <StyledSearchInputContainer>
                <SettingsTextInput
                  instanceId="workspace-members-search"
                  value={searchFilter}
                  onChange={handleSearchChange}
                  placeholder={t`Search a team member...`}
                  fullWidth
                  LeftIcon={IconSearch}
                  sizeVariant="lg"
                />
              </StyledSearchInputContainer>
            </StyledSearchContainer>
            <StyledTableContainer hasMoreRows={hasNextPage}>
              <Table>
                <TableRow
                  gridAutoColumns="150px 1fr 40px"
                  mobileGridAutoColumns="100px 1fr 32px"
                >
                  <TableHeader>
                    <Trans>Name</Trans>
                  </TableHeader>
                  <TableHeader>
                    <Trans>Email</Trans>
                  </TableHeader>
                  <TableHeader align="right"></TableHeader>
                </TableRow>
                <StyledTableRows>
                  {optimizedWorkspaceMembers.length > 0 ? (
                    optimizedWorkspaceMembers.map((workspaceMember) => (
                      <TableRow
                        gridAutoColumns="150px 1fr 40px"
                        mobileGridAutoColumns="100px 1fr 32px"
                        key={workspaceMember.id}
                        cursor="pointer"
                        onClick={() => {
                          if (
                            currentWorkspaceMember?.id === workspaceMember.id
                          ) {
                            return;
                          }
                          navigateSettings(SettingsPath.WorkspaceMemberPage, {
                            workspaceMemberId: workspaceMember.id,
                          });
                        }}
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
                        <TableCell align="right">
                          <StyledChevronWrapper>
                            {currentWorkspaceMember?.id !==
                              workspaceMember.id && (
                              <IconChevronRight size={theme.icon.size.sm} />
                            )}
                          </StyledChevronWrapper>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableCell color={themeCssVariables.font.color.tertiary}>
                      {!searchFilter
                        ? t`No members`
                        : t`No members match your search`}
                    </TableCell>
                  )}
                </StyledTableRows>
                {hasNextPage && (
                  <TableRow
                    gridAutoColumns="250px 1fr 1fr"
                    mobileGridAutoColumns="100px 1fr 1fr"
                  >
                    <TableCell>
                      <div ref={fetchMoreRef} style={{ height: '1px' }} />
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </Table>
            </StyledTableContainer>
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </>
  );
};

import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useDebounce } from 'use-debounce';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
import { type ApolloError } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { SettingsPath } from 'twenty-shared/types';
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
import { useGetWorkspaceInvitationsQuery } from '~/generated-metadata/graphql';

import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled(Table)<{ hasMoreRows?: boolean }>`
  border-bottom: ${({ hasMoreRows, theme }) =>
    hasMoreRows ? 'none' : `1px solid ${theme.border.color.light}`};
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

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledClickableTableRow = styled(TableRow)`
  cursor: pointer;
`;

const StyledChevronWrapper = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const StyledNoMembers = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsWorkspaceMembers = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [debouncedSearchFilter] = useDebounce(searchFilter, 300);

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

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  useGetWorkspaceInvitationsQuery({
    onError: (error: ApolloError) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
    onCompleted: (data) => {
      setWorkspaceInvitations(data?.findWorkspaceInvitations ?? []);
    },
  });

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
    const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.errors)) {
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
    if (isDefined(result.errors)) {
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
    const expiresAtDate = new Date(expiresAt);
    return expiresAtDate < new Date()
      ? t`Expired`
      : formatDistanceToNow(new Date(expiresAt));
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
          <WorkspaceInviteTeam />
          {isNonEmptyArray(workspaceInvitations) && (
            <StyledTable>
              <TableRow
                gridAutoColumns="250px 1fr 1fr"
                mobileGridAutoColumns="100px 1fr 1fr"
              >
                <TableHeader>
                  <Trans>Email</Trans>
                </TableHeader>
                <TableHeader align="center">
                  <Trans>Expires in</Trans>
                </TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <StyledTableRows>
                {workspaceInvitations?.map((workspaceInvitation) => (
                  <TableRow
                    gridAutoColumns="250px 1fr 1fr"
                    mobileGridAutoColumns="100px 1fr 1fr"
                    key={workspaceInvitation.id}
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
                    <TableCell align="center">
                      <Status
                        color="gray"
                        text={getExpiresAtText(workspaceInvitation.expiresAt)}
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
            </StyledTable>
          )}
        </Section>
        <Section>
          <H2Title
            title={t`Manage Members`}
            description={t`Manage the members of your workspace here`}
          />
          <StyledSearchContainer>
            <StyledSearchInput
              instanceId="workspace-members-search"
              value={searchFilter}
              onChange={handleSearchChange}
              placeholder={t`Search a team member...`}
              fullWidth
              LeftIcon={IconSearch}
              sizeVariant="lg"
            />
          </StyledSearchContainer>
          <StyledTable hasMoreRows={hasNextPage}>
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
                  <StyledClickableTableRow
                    gridAutoColumns="150px 1fr 40px"
                    mobileGridAutoColumns="100px 1fr 32px"
                    key={workspaceMember.id}
                    onClick={() => {
                      if (currentWorkspaceMember?.id === workspaceMember.id) {
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
                        {currentWorkspaceMember?.id !== workspaceMember.id && (
                          <IconChevronRight size={theme.icon.size.sm} />
                        )}
                      </StyledChevronWrapper>
                    </TableCell>
                  </StyledClickableTableRow>
                ))
              ) : (
                <StyledNoMembers>
                  {!searchFilter
                    ? t`No members`
                    : t`No members match your search`}
                </StyledNoMembers>
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
          </StyledTable>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

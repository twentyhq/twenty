import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconLogout, IconX } from 'twenty-ui/icon';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/primitives/navigation';

import { useAddChatThreadParticipant } from '@/ai/hooks/useAddChatThreadParticipant';
import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { useRemoveChatThreadParticipant } from '@/ai/hooks/useRemoveChatThreadParticipant';
import { getWorkspaceMemberFullName } from '@/ai/utils/getWorkspaceMemberFullName';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatThreadParticipantRole } from '~/generated-metadata/graphql';

type AiChatThreadParticipantsDropdownContentProps = {
  threadId: string;
};

export const AiChatThreadParticipantsDropdownContent = ({
  threadId,
}: AiChatThreadParticipantsDropdownContentProps) => {
  const { t } = useLingui();
  const [searchFilter, setSearchFilter] = useState('');
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const {
    participants,
    participantsWithMember,
    currentParticipant,
    isCurrentUserOwner,
  } = useChatThreadParticipants(threadId);
  const { addChatThreadParticipant } = useAddChatThreadParticipant(threadId);
  const { removeChatThreadParticipant } =
    useRemoveChatThreadParticipant(threadId);

  const participantUserWorkspaceIds = new Set(
    participants.map((participant) => participant.userWorkspaceId),
  );

  const normalizedSearchFilter = searchFilter.trim().toLowerCase();

  const invitableWorkspaceMembers = currentWorkspaceMembers.filter(
    (workspaceMember) =>
      isDefined(workspaceMember.userWorkspaceId) &&
      !participantUserWorkspaceIds.has(workspaceMember.userWorkspaceId) &&
      (normalizedSearchFilter.length === 0 ||
        getWorkspaceMemberFullName(workspaceMember)
          .toLowerCase()
          .includes(normalizedSearchFilter) ||
        workspaceMember.userEmail
          .toLowerCase()
          .includes(normalizedSearchFilter)),
  );

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader>{t`Participants`}</DropdownMenuHeader>
      <DropdownMenuItemsContainer hasMaxHeight>
        {participantsWithMember.map(({ participant, workspaceMember }) => {
          const fullName = getWorkspaceMemberFullName(workspaceMember);
          const isOwnerRow =
            participant.role === AgentChatThreadParticipantRole.OWNER;
          const isCurrentUserRow =
            participant.userWorkspaceId === currentParticipant?.userWorkspaceId;
          const canRemove =
            !isOwnerRow && (isCurrentUserOwner || isCurrentUserRow);

          return (
            <MenuItemAvatar
              key={participant.id}
              avatar={{
                shape: 'circle',
                size: 'md',
                name: fullName,
                colorSeed: workspaceMember.id,
                src: workspaceMember.avatarUrl,
              }}
              text={fullName}
              contextualText={isOwnerRow ? t`Owner` : undefined}
              iconButtons={
                canRemove
                  ? [
                      {
                        Icon: isCurrentUserRow ? IconLogout : IconX,
                        ariaLabel: isCurrentUserRow
                          ? t`Leave thread`
                          : t`Remove ${fullName}`,
                        onClick: () =>
                          removeChatThreadParticipant(
                            participant.userWorkspaceId,
                          ),
                      },
                    ]
                  : undefined
              }
            />
          );
        })}
      </DropdownMenuItemsContainer>
      {isCurrentUserOwner && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuHeader>{t`Add people`}</DropdownMenuHeader>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={handleSearchFilterChange}
            placeholder={t`Search`}
            autoFocus
          />
          <DropdownMenuItemsContainer hasMaxHeight>
            {invitableWorkspaceMembers.length === 0 ? (
              <MenuItem disabled text={t`No Results`} />
            ) : (
              invitableWorkspaceMembers.map((workspaceMember) => {
                const fullName = getWorkspaceMemberFullName(workspaceMember);

                return (
                  <MenuItemAvatar
                    key={workspaceMember.id}
                    onClick={() => {
                      if (isDefined(workspaceMember.userWorkspaceId)) {
                        addChatThreadParticipant(
                          workspaceMember.userWorkspaceId,
                        );
                      }
                    }}
                    avatar={{
                      shape: 'circle',
                      size: 'md',
                      name: fullName,
                      colorSeed: workspaceMember.id,
                      src: workspaceMember.avatarUrl,
                    }}
                    text={fullName}
                    contextualText={workspaceMember.userEmail}
                  />
                );
              })
            )}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { RecordSharePrincipalType, AppPath } from 'twenty-shared/types';
import { isDefined, getAppPath } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import {
  IconCheck,
  IconLink,
  IconLock,
  IconUsers,
  IconX,
} from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatSharingAction } from '@/ai/components/AiChatSharingAction';
import { useChatThreadSharing } from '@/ai/hooks/useChatThreadSharing';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatSharingDropdownContentProps = { threadId: string };

export const AiChatSharingDropdownContent = ({
  threadId,
}: AiChatSharingDropdownContentProps) => {
  const { t } = useLingui();
  const { sharing, loading, error, saving, setShare, refetch } =
    useChatThreadSharing(threadId);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { copyToClipboard } = useCopyToClipboard();
  const [search, setSearch] = useState('');
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.trim().toLowerCase());
  const shares = sharing?.shares ?? [];
  const isSharedWithEveryone = shares.some(
    (share) => share.principalType === RecordSharePrincipalType.EVERYONE,
  );
  const canAdd = sharing?.canManage === true && sharing.isEnabled && !saving;
  const availableMembers = currentWorkspaceMembers.filter(
    (member) =>
      member.id !== currentWorkspaceMember?.id &&
      !shares.some((share) => share.principalId === member.id) &&
      matchesSearch(
        `${member.name.firstName} ${member.name.lastName} ${member.userEmail}`,
      ),
  );
  const availableRoles = (sharing?.roles ?? []).filter(
    (role) =>
      !shares.some((share) => share.principalId === role.id) &&
      matchesSearch(role.label),
  );

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader>{t`Share conversation`}</DropdownMenuHeader>
      {loading ? (
        <StyledDescription>{t`Loading…`}</StyledDescription>
      ) : error ? (
        <>
          <StyledDescription role="alert">{t`Sharing settings could not be loaded.`}</StyledDescription>
          <AiChatSharingAction
            text={t`Try again`}
            onClick={() => {
              void refetch().catch(() => {});
            }}
          />
        </>
      ) : (
        isDefined(sharing) && (
          <>
            <StyledDescription>{t`People with access can read this conversation and future messages. Only the owner can send messages or make changes.`}</StyledDescription>
            {!sharing.isEnabled && sharing.canManage && (
              <StyledDescription>{t`Sharing is unavailable for this workspace. Existing shared access is paused; you can still remove people and roles.`}</StyledDescription>
            )}
            {sharing.canManage ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuHeader>{t`General access`}</DropdownMenuHeader>
                <DropdownMenuItemsContainer>
                  <AiChatSharingAction
                    text={t`Restricted`}
                    contextualText={t`Only people and roles you add`}
                    LeftIcon={isSharedWithEveryone ? undefined : IconCheck}
                    disabled={saving || !isSharedWithEveryone}
                    onClick={() => {
                      void setShare({ everyone: true }, false);
                    }}
                  />
                  <AiChatSharingAction
                    text={t`Everyone in the workspace`}
                    contextualText={t`Viewer`}
                    LeftIcon={isSharedWithEveryone ? IconCheck : IconUsers}
                    disabled={!canAdd || isSharedWithEveryone}
                    onClick={() => {
                      void setShare({ everyone: true }, true);
                    }}
                  />
                </DropdownMenuItemsContainer>
                <DropdownMenuSeparator />
                <DropdownMenuHeader>{t`People and roles with access`}</DropdownMenuHeader>
                <DropdownMenuItemsContainer hasMaxHeight>
                  <MenuItem
                    text={t`You`}
                    contextualText={t`Owner`}
                    LeftIcon={IconUsers}
                    disabled
                  />
                  {shares
                    .filter(
                      (share) =>
                        share.principalType !==
                        RecordSharePrincipalType.EVERYONE,
                    )
                    .map((share) => {
                      const member = currentWorkspaceMembers.find(
                        (item) => item.id === share.principalId,
                      );
                      const role = sharing.roles.find(
                        (item) => item.id === share.principalId,
                      );
                      const label =
                        share.principalType === RecordSharePrincipalType.ROLE
                          ? (role?.label ?? t`Deleted role`)
                          : isDefined(member)
                            ? `${member.name.firstName} ${member.name.lastName}`.trim() ||
                              member.userEmail
                            : t`Deleted member`;
                      return (
                        <MenuItem
                          key={share.id}
                          text={label}
                          contextualText={t`Viewer`}
                          LeftIcon={
                            share.principalType ===
                            RecordSharePrincipalType.ROLE
                              ? IconLock
                              : IconUsers
                          }
                          iconButtons={
                            <LightIconButton
                              aria-label={t`Remove ${label}`}
                              disabled={saving}
                              onClick={() => {
                                void setShare(
                                  share.principalType ===
                                    RecordSharePrincipalType.ROLE
                                    ? { roleId: share.principalId }
                                    : { workspaceMemberId: share.principalId },
                                  false,
                                );
                              }}
                            >
                              <IconX />
                            </LightIconButton>
                          }
                        />
                      );
                    })}
                </DropdownMenuItemsContainer>
                {sharing.isEnabled && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuSearchInput
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={t`Add people or roles`}
                    />
                    <DropdownMenuItemsContainer hasMaxHeight>
                      {availableMembers.length === 0 &&
                        availableRoles.length === 0 && (
                          <StyledDescription>{t`No matching people or roles`}</StyledDescription>
                        )}
                      {availableMembers.map((member) => (
                        <AiChatSharingAction
                          key={member.id}
                          text={
                            `${member.name.firstName} ${member.name.lastName}`.trim() ||
                            member.userEmail
                          }
                          contextualText={member.userEmail}
                          LeftIcon={IconUsers}
                          disabled={!canAdd}
                          onClick={() => {
                            void setShare(
                              { workspaceMemberId: member.id },
                              true,
                            );
                          }}
                        />
                      ))}
                      {availableRoles.map((role) => (
                        <AiChatSharingAction
                          key={role.id}
                          text={role.label}
                          contextualText={t`Role`}
                          LeftIcon={IconLock}
                          disabled={!canAdd}
                          onClick={() => {
                            void setShare({ roleId: role.id }, true);
                          }}
                        />
                      ))}
                    </DropdownMenuItemsContainer>
                  </>
                )}
              </>
            ) : (
              <StyledDescription>{t`You have view-only access. Contact the owner to change sharing.`}</StyledDescription>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer>
              <AiChatSharingAction
                text={t`Copy link`}
                LeftIcon={IconLink}
                onClick={() => {
                  void copyToClipboard(
                    new URL(
                      getAppPath(AppPath.AiChat, { threadId }),
                      window.location.origin,
                    ).href,
                  );
                }}
              />
            </DropdownMenuItemsContainer>
          </>
        )
      )}
    </DropdownContent>
  );
};

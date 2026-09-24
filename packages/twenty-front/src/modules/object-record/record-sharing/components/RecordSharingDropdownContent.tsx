import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconLink, IconLock, IconPlus, IconUsers } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { RecordSharingAccessSelect } from '@/object-record/record-sharing/components/RecordSharingAccessSelect';
import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]};
  white-space: normal;
`;

const StyledRecipients = styled.div`
  max-height: 240px;
  overflow-y: auto;
`;

type RecordSharingDropdownContentProps = {
  title: string;
  recordUrl: string;
  sharingState: ReturnType<typeof useRecordSharing>;
};

export const RecordSharingDropdownContent = ({
  title,
  recordUrl,
  sharingState,
}: RecordSharingDropdownContentProps) => {
  const { t } = useLingui();
  const { sharing, loading, error, saving, setShare, refetch } = sharingState;
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { copyToClipboard } = useCopyToClipboard();
  const [search, setSearch] = useState('');
  const [invitationAccessLevel, setInvitationAccessLevel] = useState(
    RecordShareAccessLevel.READ,
  );
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.trim().toLowerCase());
  const shares = sharing?.shares ?? [];
  const everyoneManualShare = shares.find(
    (share) =>
      share.principalType === RecordSharePrincipalType.EVERYONE &&
      share.rowCause === RecordShareRowCause.MANUAL,
  );
  const hasManagedWorkspaceAccess = shares.some(
    (share) =>
      share.principalType === RecordSharePrincipalType.EVERYONE &&
      share.rowCause !== RecordShareRowCause.MANUAL,
  );
  const canChangeSharing =
    sharing?.viewerAccessLevel === RecordShareAccessLevel.FULL &&
    sharing.permissions.canUpdate;
  const availableMembers = currentWorkspaceMembers.filter(
    (member) =>
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
  const accessOptions = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.map((option) => ({
    ...option,
    label: t(option.label),
  }));

  return (
    <>
      <DropdownMenuHeader>{title}</DropdownMenuHeader>
      {loading ? (
        <Dropdown.Loading>{t`Loading…`}</Dropdown.Loading>
      ) : error ? (
        <Dropdown.Section>
          <StyledDescription role="alert">{t`Sharing settings could not be loaded.`}</StyledDescription>
          <Dropdown.ActionItem
            onClick={() => {
              void refetch().catch(() => {});
            }}
            closeOnClick={false}
          >{t`Try again`}</Dropdown.ActionItem>
        </Dropdown.Section>
      ) : (
        isDefined(sharing) && (
          <>
            {canChangeSharing ? (
              <>
                <Dropdown.Section>
                  <Dropdown.Submenu type="picker">
                    <Dropdown.SubmenuTrigger
                      startIcon={<IconPlus />}
                      disabled={saving}
                      openOnHover={false}
                    >{t`Add people or roles`}</Dropdown.SubmenuTrigger>
                    <Dropdown.Content
                      width={320}
                      aria-label={t`Add people or roles`}
                    >
                      <Dropdown.Search
                        value={search}
                        onValueChange={setSearch}
                        placeholder={t`Search people or roles`}
                      />
                      <Dropdown.Section>
                        <RecordSharingAccessSelect
                          label={t`Invitation access`}
                          text={t`Invite as`}
                          value={invitationAccessLevel}
                          disabled={saving}
                          onChange={setInvitationAccessLevel}
                          closeOnSelect={false}
                        />
                      </Dropdown.Section>
                      <Dropdown.Separator />
                      <StyledRecipients>
                        <Dropdown.Section>
                          {availableMembers.length === 0 &&
                            availableRoles.length === 0 && (
                              <Dropdown.Empty>{t`No matching people or roles`}</Dropdown.Empty>
                            )}
                          {availableMembers.map((member) => (
                            <Dropdown.ActionItem
                              key={member.id}
                              startIcon={<IconUsers />}
                              description={member.userEmail}
                              disabled={saving}
                              onClick={() => {
                                void setShare({
                                  principal: { workspaceMemberId: member.id },
                                  enabled: true,
                                  accessLevel: invitationAccessLevel,
                                });
                              }}
                            >
                              {`${member.name.firstName} ${member.name.lastName}`.trim() ||
                                member.userEmail}
                            </Dropdown.ActionItem>
                          ))}
                          {availableRoles.map((role) => (
                            <Dropdown.ActionItem
                              key={role.id}
                              startIcon={<IconLock />}
                              description={t`Role`}
                              disabled={saving}
                              onClick={() => {
                                void setShare({
                                  principal: { roleId: role.id },
                                  enabled: true,
                                  accessLevel: invitationAccessLevel,
                                });
                              }}
                            >
                              {role.label}
                            </Dropdown.ActionItem>
                          ))}
                        </Dropdown.Section>
                      </StyledRecipients>
                    </Dropdown.Content>
                  </Dropdown.Submenu>
                </Dropdown.Section>
                <Dropdown.Separator />
                <Dropdown.Section label={t`General access`}>
                  <Dropdown.Submenu>
                    <Dropdown.SubmenuTrigger
                      startIcon={
                        isDefined(everyoneManualShare) ||
                        hasManagedWorkspaceAccess ? (
                          <IconUsers />
                        ) : (
                          <IconLock />
                        )
                      }
                      disabled={saving}
                      description={
                        isDefined(everyoneManualShare)
                          ? accessOptions.find(
                              (option) =>
                                option.value ===
                                everyoneManualShare.accessLevel,
                            )?.label
                          : undefined
                      }
                    >
                      {isDefined(everyoneManualShare) ||
                      hasManagedWorkspaceAccess
                        ? t`Everyone in the workspace`
                        : t`Restricted`}
                    </Dropdown.SubmenuTrigger>
                    <Dropdown.Content
                      width={240}
                      aria-label={t`General access`}
                    >
                      <Dropdown.Section>
                        <Dropdown.OptionItem
                          selected={
                            !isDefined(everyoneManualShare) &&
                            !hasManagedWorkspaceAccess
                          }
                          disabled={!isDefined(everyoneManualShare) || saving}
                          onSelect={() => {
                            void setShare({
                              principal: { everyone: true },
                              enabled: false,
                            });
                          }}
                        >{t`Restricted`}</Dropdown.OptionItem>
                      </Dropdown.Section>
                      <Dropdown.Separator />
                      <Dropdown.Section label={t`Everyone in the workspace`}>
                        {accessOptions.map((option) => (
                          <Dropdown.OptionItem
                            key={option.value}
                            selected={
                              everyoneManualShare?.accessLevel === option.value
                            }
                            disabled={saving}
                            onSelect={() => {
                              void setShare({
                                principal: { everyone: true },
                                enabled: true,
                                accessLevel: option.value,
                              });
                            }}
                          >
                            {option.label}
                          </Dropdown.OptionItem>
                        ))}
                      </Dropdown.Section>
                    </Dropdown.Content>
                  </Dropdown.Submenu>
                </Dropdown.Section>
                <Dropdown.Separator />
                <Dropdown.Section label={t`People and roles with access`}>
                  <StyledRecipients>
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
                        const label = getRecordShareLabel({
                          share,
                          member,
                          role,
                          currentWorkspaceMember,
                        });
                        const startIcon =
                          share.principalType ===
                          RecordSharePrincipalType.ROLE ? (
                            <IconLock />
                          ) : (
                            <IconUsers />
                          );
                        const principal =
                          share.principalType === RecordSharePrincipalType.ROLE
                            ? { roleId: share.principalId }
                            : { workspaceMemberId: share.principalId };
                        return share.rowCause === RecordShareRowCause.MANUAL ? (
                          <RecordSharingAccessSelect
                            key={share.id}
                            label={t`${label} access`}
                            text={label}
                            startIcon={startIcon}
                            value={share.accessLevel}
                            disabled={saving}
                            onChange={(accessLevel) => {
                              void setShare({
                                principal,
                                enabled: true,
                                accessLevel,
                              });
                            }}
                            onRemove={() => {
                              void setShare({ principal, enabled: false });
                            }}
                          />
                        ) : (
                          <Dropdown.ActionItem
                            key={share.id}
                            startIcon={startIcon}
                            disabled
                            description={
                              share.rowCause === RecordShareRowCause.OWNER
                                ? t`Owner`
                                : t`Managed access`
                            }
                          >
                            {label}
                          </Dropdown.ActionItem>
                        );
                      })}
                  </StyledRecipients>
                </Dropdown.Section>
                <StyledDescription>
                  {hasManagedWorkspaceAccess
                    ? t`Workspace access is also managed by an application.`
                    : sharing.hasInheritedAccess
                      ? t`Access is also inherited from related records.`
                      : t`Role and field permissions still apply.`}
                </StyledDescription>
              </>
            ) : (
              <StyledDescription>{t`Full access and edit permission are required to manage sharing.`}</StyledDescription>
            )}
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconLink />}
                onClick={() => {
                  void copyToClipboard(recordUrl);
                }}
              >{t`Copy link`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )
      )}
    </>
  );
};

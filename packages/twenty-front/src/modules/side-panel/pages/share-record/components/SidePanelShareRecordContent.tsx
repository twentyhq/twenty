import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import {
  IconLink,
  IconLock,
  IconPlus,
  IconRefresh,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { RecordSharingAccessSelect } from '@/object-record/record-sharing/components/RecordSharingAccessSelect';
import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const ADD_PEOPLE_ITEM_ID = 'share-record-add-people';
const GENERAL_ACCESS_ITEM_ID = 'share-record-general-access';
const RETRY_ITEM_ID = 'share-record-retry';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  white-space: normal;
`;

const StyledRecipients = styled.div`
  max-height: 240px;
  overflow-y: auto;
`;

type SidePanelShareRecordContentProps = {
  recordUrl: string;
  sharingState: ReturnType<typeof useRecordSharing>;
};

export const SidePanelShareRecordContent = ({
  recordUrl,
  sharingState,
}: SidePanelShareRecordContentProps) => {
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
  const hasWorkspaceAccess =
    isDefined(everyoneManualShare) || hasManagedWorkspaceAccess;
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
  const getAccessLevelLabel = (accessLevel: RecordShareAccessLevel) => {
    const option = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.find(
      (accessLevelOption) => accessLevelOption.value === accessLevel,
    );

    return isDefined(option) ? t(option.label) : undefined;
  };

  const recipients = shares
    .filter(
      (share) => share.principalType !== RecordSharePrincipalType.EVERYONE,
    )
    .map((share) => {
      const isRole = share.principalType === RecordSharePrincipalType.ROLE;

      return {
        share,
        label: getRecordShareLabel({
          share,
          member: currentWorkspaceMembers.find(
            (member) => member.id === share.principalId,
          ),
          role: sharing?.roles.find((role) => role.id === share.principalId),
          currentWorkspaceMember,
        }),
        Icon: isRole ? IconLock : IconUsers,
        principal: isRole
          ? { roleId: share.principalId }
          : { workspaceMemberId: share.principalId },
        isEditable: share.rowCause === RecordShareRowCause.MANUAL,
      };
    });

  const selectableItemIds = isDefined(error)
    ? [RETRY_ITEM_ID]
    : canChangeSharing
      ? [
          ADD_PEOPLE_ITEM_ID,
          GENERAL_ACCESS_ITEM_ID,
          ...recipients
            .filter((recipient) => recipient.isEditable)
            .map((recipient) => recipient.share.id),
        ]
      : [];

  return (
    <StyledContainer>
      <StyledListContainer>
        <SidePanelList selectableItemIds={selectableItemIds} loading={loading}>
          {isDefined(error) ? (
            <>
              <StyledDescription role="alert">{t`Sharing settings could not be loaded.`}</StyledDescription>
              <SelectableListItem
                itemId={RETRY_ITEM_ID}
                onEnter={() => {
                  void refetch().catch(() => {});
                }}
              >
                <CommandMenuItem
                  id={RETRY_ITEM_ID}
                  label={t`Try again`}
                  Icon={IconRefresh}
                  onClick={() => {
                    void refetch().catch(() => {});
                  }}
                />
              </SelectableListItem>
            </>
          ) : (
            isDefined(sharing) &&
            (canChangeSharing ? (
              <>
                <SidePanelShareRecordDropdownItem
                  itemId={ADD_PEOPLE_ITEM_ID}
                  label={t`Add people or roles`}
                  Icon={IconPlus}
                  disabled={saving}
                  type="picker"
                  width={320}
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
                </SidePanelShareRecordDropdownItem>
                <SidePanelGroup heading={t`General access`}>
                  <SidePanelShareRecordDropdownItem
                    itemId={GENERAL_ACCESS_ITEM_ID}
                    label={
                      hasWorkspaceAccess
                        ? t`Everyone in the workspace`
                        : t`Restricted`
                    }
                    Icon={hasWorkspaceAccess ? IconUsers : IconLock}
                    description={
                      isDefined(everyoneManualShare)
                        ? getAccessLevelLabel(everyoneManualShare.accessLevel)
                        : undefined
                    }
                    disabled={saving}
                    width={240}
                  >
                    <Dropdown.Section>
                      <Dropdown.OptionItem
                        selected={!hasWorkspaceAccess}
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
                      {RECORD_SHARE_ACCESS_LEVEL_OPTIONS.map((option) => (
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
                          {t(option.label)}
                        </Dropdown.OptionItem>
                      ))}
                    </Dropdown.Section>
                  </SidePanelShareRecordDropdownItem>
                </SidePanelGroup>
                <SidePanelGroup heading={t`People and roles with access`}>
                  {recipients.map(
                    ({ share, label, Icon, principal, isEditable }) =>
                      isEditable ? (
                        <SidePanelShareRecordDropdownItem
                          key={share.id}
                          itemId={share.id}
                          label={label}
                          Icon={Icon}
                          description={getAccessLevelLabel(share.accessLevel)}
                          disabled={saving}
                        >
                          <RecordSharingAccessLevelOptions
                            value={share.accessLevel}
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
                        </SidePanelShareRecordDropdownItem>
                      ) : (
                        <CommandMenuItem
                          key={share.id}
                          id={share.id}
                          label={label}
                          Icon={Icon}
                          description={
                            share.rowCause === RecordShareRowCause.OWNER
                              ? t`Owner`
                              : t`Managed access`
                          }
                          contextualTextPosition="right"
                          disabled
                        />
                      ),
                  )}
                </SidePanelGroup>
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
            ))
          )}
        </SidePanelList>
      </StyledListContainer>
      <SidePanelFooter
        actions={[
          <Button
            key="copy-link"
            size="sm"
            variant="outline"
            startIcon={<IconLink />}
            onClick={() => {
              void copyToClipboard(recordUrl);
            }}
          >{t`Copy link`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};

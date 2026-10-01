import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { useLingui } from '@lingui/react/macro';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconLock, IconRefresh, IconUsers } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { getRecordShareRoleAccessNote } from '@/object-record/record-sharing/utils/getRecordShareRoleAccessNote';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelShareRecordAddPeopleItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordAddPeopleItem';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { SidePanelShareRecordGeneralAccessItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGeneralAccessItem';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
} from '~/generated-metadata/graphql';
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

const StyledRoleAccessNote = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[8]};
`;

type SidePanelShareRecordContentProps = {
  recordUrl: string;
  objectLabelPlural: string;
  sharingState: ReturnType<typeof useRecordSharing>;
};

export const SidePanelShareRecordContent = ({
  recordUrl,
  objectLabelPlural,
  sharingState,
}: SidePanelShareRecordContentProps) => {
  const { t } = useLingui();
  const { sharing, loading, error, saving, setShare, refetch } = sharingState;
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { copyToClipboard } = useCopyToClipboard();
  const shares = sharing?.shares ?? [];
  const hasManagedWorkspaceAccess = shares.some(
    (share) =>
      share.principalType === RecordSharePrincipalType.EVERYONE &&
      share.rowCause !== RecordShareRowCause.MANUAL,
  );
  const canChangeSharing =
    sharing?.viewerAccessLevel === RecordShareAccessLevel.FULL &&
    sharing.permissions.canUpdate;
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
        roleAccessNote: isDefined(sharing)
          ? getRecordShareRoleAccessNote({
              share,
              sharingReach: sharing.sharingReach,
              objectLabelPlural,
            })
          : undefined,
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
                <SidePanelShareRecordAddPeopleItem
                  itemId={ADD_PEOPLE_ITEM_ID}
                  sharing={sharing}
                  saving={saving}
                  setShare={setShare}
                />
                <SidePanelGroup heading={t`General access`}>
                  <SidePanelShareRecordGeneralAccessItem
                    itemId={GENERAL_ACCESS_ITEM_ID}
                    generalAccessLevel={sharing.generalAccessLevel}
                    isOpenByDefault={sharing.isOpenByDefault}
                    hasManagedWorkspaceAccess={hasManagedWorkspaceAccess}
                    objectLabelPlural={objectLabelPlural}
                    saving={saving}
                    setShare={setShare}
                  />
                </SidePanelGroup>
                <SidePanelGroup heading={t`People and roles with access`}>
                  {recipients.map(
                    ({
                      share,
                      label,
                      Icon,
                      principal,
                      isEditable,
                      roleAccessNote,
                    }) => (
                      <Fragment key={share.id}>
                        {isEditable ? (
                          <SidePanelShareRecordDropdownItem
                            itemId={share.id}
                            label={label}
                            Icon={Icon}
                            description={getRecordShareAccessLevelLabel(
                              share.accessLevel,
                            )}
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
                        )}
                        {isDefined(roleAccessNote) && (
                          <StyledRoleAccessNote>
                            {roleAccessNote}
                          </StyledRoleAccessNote>
                        )}
                      </Fragment>
                    ),
                  )}
                </SidePanelGroup>
                <StyledDescription>
                  {hasManagedWorkspaceAccess
                    ? t`Workspace access is also managed by an application.`
                    : sharing.hasInheritedAccess
                      ? t`Access is also inherited from related records.`
                      : sharing.sharingReach === ObjectSharingReach.WORKSPACE
                        ? t`People you add get this record even if their role can't access ${objectLabelPlural}. Field permissions still apply.`
                        : t`Role and field permissions still apply.`}
                </StyledDescription>
              </>
            ) : (
              <StyledDescription>{t`Only the creator of this record and people with full access to it can change who has access.`}</StyledDescription>
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

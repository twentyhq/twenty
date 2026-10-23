import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLock, IconUsers } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { getRecordShareRoleAccessNote } from '@/object-record/record-sharing/utils/getRecordShareRoleAccessNote';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import {
  type ObjectSharingReach,
  RecordSharePrincipalType,
  RecordShareRowCause,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledRoleAccessNote = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[8]};
`;

type SidePanelShareRecordRecipientProps = {
  share: RecordSharingFieldsFragment['shares'][number];
  label: string;
  member: PartialWorkspaceMember | undefined;
  roles: RecordSharingFieldsFragment['roles'];
  objectLabelPlural: string;
  sharingReach: ObjectSharingReach;
  isSaving: boolean;
  setShare: ReturnType<typeof useRecordSharing>['setShare'];
  removeShare: ReturnType<typeof useRecordSharing>['removeShare'];
};

export const SidePanelShareRecordRecipient = ({
  share,
  label,
  member,
  roles,
  objectLabelPlural,
  sharingReach,
  isSaving,
  setShare,
  removeShare,
}: SidePanelShareRecordRecipientProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const isRole = share.principalType === RecordSharePrincipalType.ROLE;
  const principalRoleId = isRole ? share.principalId : share.principalRoleId;
  const principal = isRole
    ? { roleId: share.principalId }
    : { workspaceMemberId: share.principalId };
  const Icon = isRole ? IconLock : IconUsers;
  const avatar = isDefined(member) ? (
    <ListItemIconContainer>
      <Avatar
        src={getAbsoluteImageUrl(member.avatarUrl)}
        name={getWorkspaceMemberNameOrEmail(member)}
        colorSeed={member.id}
        shape="circle"
      />
    </ListItemIconContainer>
  ) : undefined;
  const roleAccessNote = getRecordShareRoleAccessNote({
    accessLevel: share.accessLevel,
    principalRole: roles.find(({ id }) => id === principalRoleId),
    sharingReach,
    objectLabelPlural,
  });
  const isEditable = share.rowCause === RecordShareRowCause.MANUAL;
  const getRecipientItem = () => {
    if (!isEditable) {
      return (
        <ListItem
          startIcon={
            avatar ?? (
              <ListItemIconContainer>
                <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              </ListItemIconContainer>
            )
          }
          description={
            share.rowCause === RecordShareRowCause.OWNER
              ? t`Owner`
              : t`Managed access`
          }
          descriptionPlacement="end"
          disabled
        >
          {label}
        </ListItem>
      );
    }

    return (
      <SidePanelShareRecordDropdownItem
        label={label}
        Icon={Icon}
        LeftComponent={avatar}
        description={getRecordShareAccessLevelLabel(share.accessLevel)}
        disabled={isSaving}
      >
        <RecordSharingAccessLevelOptions
          value={share.accessLevel}
          onChange={(accessLevel) => {
            void setShare({ principal, accessLevel });
          }}
          onRemove={() => {
            void removeShare({ principal });
          }}
        />
      </SidePanelShareRecordDropdownItem>
    );
  };

  return (
    <>
      {getRecipientItem()}
      {isDefined(roleAccessNote) && (
        <StyledRoleAccessNote>{roleAccessNote}</StyledRoleAccessNote>
      )}
    </>
  );
};

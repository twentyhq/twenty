import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconUsers, IconX, useIcons } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SHARE_RECORD_ACCESS_LEVEL_SELECT_DROPDOWN_ID } from '@/record-share/constants/ShareRecordAccessLevelSelectDropdownId';
import { useRecordShareAccessLevelOptions } from '@/record-share/hooks/useRecordShareAccessLevelOptions';
import { useRecordShareRowCauseLabel } from '@/record-share/hooks/useRecordShareRowCauseLabel';
import { useShareableRoles } from '@/record-share/hooks/useShareableRoles';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type RecordShare,
  type RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from '~/generated-metadata/graphql';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[8]};
`;

const StyledPrincipal = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: calc(${themeCssVariables.icon.size.md} * 1px);
  justify-content: center;
  width: calc(${themeCssVariables.icon.size.md} * 1px);
`;

const StyledCause = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAccessLevel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ShareRecordGrantRowProps = {
  share: RecordShare;
  canEdit: boolean;
  onAccessLevelChange: (accessLevel: RecordShareAccessLevel) => void;
  onRemove: () => void;
};

export const ShareRecordGrantRow = ({
  share,
  canEdit,
  onAccessLevelChange,
  onRemove,
}: ShareRecordGrantRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { roles } = useShareableRoles();
  const accessLevelOptions = useRecordShareAccessLevelOptions();
  const { getRecordShareRowCauseLabel } = useRecordShareRowCauseLabel();

  const isManual = share.rowCause === RecordShareRowCause.MANUAL;

  const renderPrincipal = () => {
    switch (share.principalType) {
      case RecordSharePrincipalType.EVERYONE:
        return (
          <>
            <StyledIconContainer>
              <IconUsers size={theme.icon.size.md} />
            </StyledIconContainer>
            {t`Everyone`}
          </>
        );
      case RecordSharePrincipalType.WORKSPACE_MEMBER: {
        const workspaceMember = currentWorkspaceMembers.find(
          (member) => member.id === share.principalId,
        );
        const fullName = isDefined(workspaceMember)
          ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
          : t`Unknown member`;

        return (
          <>
            <Avatar
              type="rounded"
              size="md"
              placeholder={fullName}
              placeholderColorSeed={share.principalId}
              avatarUrl={workspaceMember?.avatarUrl}
            />
            {fullName}
          </>
        );
      }
      case RecordSharePrincipalType.ROLE: {
        const role = roles.find((role) => role.id === share.principalId);
        const RoleIcon = getIcon(role?.icon, 'IconLock');

        return (
          <>
            <StyledIconContainer>
              <RoleIcon size={theme.icon.size.md} />
            </StyledIconContainer>
            {role?.label ?? t`Role you cannot see`}
          </>
        );
      }
    }
  };

  const accessLevelLabel = accessLevelOptions.find(
    (option) => option.value === share.accessLevel,
  )?.label;

  return (
    <StyledRow>
      <StyledPrincipal>
        {renderPrincipal()}
        <StyledCause>{getRecordShareRowCauseLabel(share.rowCause)}</StyledCause>
      </StyledPrincipal>
      {canEdit && isManual ? (
        <Select
          dropdownId={`${SHARE_RECORD_ACCESS_LEVEL_SELECT_DROPDOWN_ID}-${share.id}`}
          isDropdownInModal
          options={accessLevelOptions}
          value={share.accessLevel}
          onChange={onAccessLevelChange}
          selectSizeVariant="small"
        />
      ) : (
        <StyledAccessLevel>{accessLevelLabel}</StyledAccessLevel>
      )}
      {canEdit && isManual && (
        <LightIconButton
          Icon={IconX}
          size="small"
          accent="tertiary"
          aria-label={t`Remove`}
          onClick={onRemove}
        />
      )}
    </StyledRow>
  );
};

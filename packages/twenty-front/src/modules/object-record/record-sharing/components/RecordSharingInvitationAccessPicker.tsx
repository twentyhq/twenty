import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Dropdown, ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronRight, IconUserPlus } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { RECORD_SHARING_ACCESS_MENU_SIDE_OFFSET_IN_PX } from '@/object-record/record-sharing/constants/RecordSharingAccessMenuSideOffsetInPx';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { type RecordShareAccessLevel } from '~/generated-metadata/graphql';

type RecordSharingInvitationAccessPickerProps = {
  value: RecordShareAccessLevel;
  hasEveryoneRecipient: boolean;
  disabled: boolean;
  onChange: (value: RecordShareAccessLevel) => void;
};

export const RecordSharingInvitationAccessPicker = ({
  value,
  hasEveryoneRecipient,
  disabled,
  onChange,
}: RecordSharingInvitationAccessPickerProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = useId();

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        disabled={disabled}
        aria-label={t`Invite as ${getRecordShareAccessLevelLabel(value)}`}
        render={
          <ListItemButton
            startIcon={
              <ListItemIconContainer>
                <IconUserPlus
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              </ListItemIconContainer>
            }
            description={getRecordShareAccessLevelLabel(value)}
            descriptionPlacement="end"
            endIcon={<IconChevronRight />}
          >
            {t`Invite as`}
          </ListItemButton>
        }
      />
      <DropdownContent
        aria-label={t`Invitation access`}
        align="end"
        sideOffset={RECORD_SHARING_ACCESS_MENU_SIDE_OFFSET_IN_PX}
        width={GenericDropdownContentWidth.Narrow}
      >
        <RecordSharingAccessLevelOptions
          value={value}
          onChange={onChange}
          shouldExcludeFullAccess={hasEveryoneRecipient}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};

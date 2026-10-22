import { useLingui } from '@lingui/react/macro';
import { Dropdown, ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronRight, IconUserPlus } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
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

  return (
    <Dropdown.Root type="menu">
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
      <Dropdown.Content
        aria-label={t`Invitation access`}
        align="end"
        sideOffset={4}
        width={160}
      >
        <RecordSharingAccessLevelOptions
          value={value}
          onChange={onChange}
          excludeFullAccess={hasEveryoneRecipient}
        />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

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
  const options = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.filter(
    (option) =>
      !hasEveryoneRecipient || option.value !== RecordShareAccessLevel.FULL,
  );

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger
        disabled={disabled}
        render={
          <Button
            size="sm"
            variant="ghost"
            aria-label={t`Invitation access`}
            endIcon={<IconChevronDown />}
          >
            {getRecordShareAccessLevelLabel(value)}
          </Button>
        }
      />
      <Dropdown.Content aria-label={t`Invitation access`} width={160}>
        <Dropdown.Section>
          {options.map((option) => (
            <Dropdown.OptionItem
              key={option.value}
              selected={value === option.value}
              disabled={disabled}
              onSelect={() => onChange(option.value)}
            >
              {t(option.label)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

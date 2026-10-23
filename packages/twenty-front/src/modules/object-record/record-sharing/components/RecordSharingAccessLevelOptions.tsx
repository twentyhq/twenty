import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconEye,
  IconKey,
  IconLock,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const ACCESS_LEVEL_ICONS = {
  [RecordShareAccessLevel.NONE]: IconLock,
  [RecordShareAccessLevel.READ]: IconEye,
  [RecordShareAccessLevel.READ_WRITE]: IconPencil,
  [RecordShareAccessLevel.FULL]: IconKey,
};

type RecordSharingAccessLevelOptionsProps = {
  value: RecordShareAccessLevel;
  onChange: (value: RecordShareAccessLevel) => void;
  onRemove?: () => void;
  closeOnSelect?: boolean;
  shouldExcludeFullAccess?: boolean;
};

export const RecordSharingAccessLevelOptions = ({
  value,
  onChange,
  onRemove,
  closeOnSelect,
  shouldExcludeFullAccess = false,
}: RecordSharingAccessLevelOptionsProps) => {
  const { t } = useLingui();
  const options = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.filter(
    (option) =>
      !shouldExcludeFullAccess || option.value !== RecordShareAccessLevel.FULL,
  );

  return (
    <>
      <Dropdown.Section>
        {options.map((option) => {
          const Icon = ACCESS_LEVEL_ICONS[option.value];

          return (
            <Dropdown.OptionItem
              key={option.value}
              startIcon={<Icon />}
              selected={option.value === value}
              closeOnSelect={closeOnSelect}
              onSelect={() => onChange(option.value)}
            >
              {t(option.label)}
            </Dropdown.OptionItem>
          );
        })}
      </Dropdown.Section>
      {onRemove && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              startIcon={<IconTrash />}
              color="danger"
              onClick={onRemove}
            >
              {t`Remove access`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </>
      )}
    </>
  );
};

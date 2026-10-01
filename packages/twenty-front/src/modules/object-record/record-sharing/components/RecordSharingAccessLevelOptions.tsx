import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type RecordShareAccessLevel } from '~/generated-metadata/graphql';

type RecordSharingAccessLevelOptionsProps = {
  value: RecordShareAccessLevel;
  onChange: (value: RecordShareAccessLevel) => void;
  onRemove?: () => void;
  closeOnSelect?: boolean;
};

export const RecordSharingAccessLevelOptions = ({
  value,
  onChange,
  onRemove,
  closeOnSelect,
}: RecordSharingAccessLevelOptionsProps) => {
  const { t } = useLingui();

  return (
    <>
      <Dropdown.Section>
        {RECORD_SHARE_ACCESS_LEVEL_OPTIONS.map((option) => (
          <Dropdown.OptionItem
            key={option.value}
            selected={option.value === value}
            closeOnSelect={closeOnSelect}
            onSelect={() => onChange(option.value)}
          >
            {t(option.label)}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
      {onRemove && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem color="danger" onClick={onRemove}>
              {t`Remove access`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </>
      )}
    </>
  );
};

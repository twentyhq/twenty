import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { RecordSharingAccessLevelOptions } from '@/object-record/record-sharing/components/RecordSharingAccessLevelOptions';
import { RECORD_SHARE_ACCESS_LEVEL_OPTIONS } from '@/object-record/record-sharing/constants/RecordShareAccessLevelOptions';
import { type RecordShareAccessLevel } from '~/generated-metadata/graphql';

type RecordSharingAccessSelectProps = {
  label: string;
  text: string;
  startIcon?: ReactElement;
  value: RecordShareAccessLevel;
  disabled?: boolean;
  onChange: (value: RecordShareAccessLevel) => void;
  closeOnSelect?: boolean;
};

export const RecordSharingAccessSelect = ({
  label,
  text,
  startIcon,
  value,
  disabled,
  onChange,
  closeOnSelect,
}: RecordSharingAccessSelectProps) => {
  const { t } = useLingui();
  const selectedOption = RECORD_SHARE_ACCESS_LEVEL_OPTIONS.find(
    (option) => option.value === value,
  );

  return (
    <Dropdown.Submenu>
      <Dropdown.SubmenuTrigger
        aria-label={label}
        startIcon={startIcon}
        description={selectedOption ? t(selectedOption.label) : undefined}
        disabled={disabled}
      >
        {text}
      </Dropdown.SubmenuTrigger>
      <Dropdown.Content aria-label={label}>
        <RecordSharingAccessLevelOptions
          value={value}
          onChange={onChange}
          closeOnSelect={closeOnSelect}
        />
      </Dropdown.Content>
    </Dropdown.Submenu>
  );
};

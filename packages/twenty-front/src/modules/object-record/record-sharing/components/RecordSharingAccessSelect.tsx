import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

type RecordSharingAccessSelectProps = {
  label: string;
  text: string;
  startIcon?: ReactElement;
  value: RecordShareAccessLevel;
  disabled?: boolean;
  onChange: (value: RecordShareAccessLevel) => void;
  onRemove?: () => void;
  closeOnSelect?: boolean;
};

export const RecordSharingAccessSelect = ({
  label,
  text,
  startIcon,
  value,
  disabled,
  onChange,
  onRemove,
  closeOnSelect,
}: RecordSharingAccessSelectProps) => {
  const { t } = useLingui();
  const options = [
    { value: RecordShareAccessLevel.READ, label: t`Viewer` },
    { value: RecordShareAccessLevel.READ_WRITE, label: t`Editor` },
    { value: RecordShareAccessLevel.FULL, label: t`Full access` },
  ];

  return (
    <Dropdown.Submenu>
      <Dropdown.SubmenuTrigger
        aria-label={label}
        startIcon={startIcon}
        description={options.find((option) => option.value === value)?.label}
        disabled={disabled}
      >
        {text}
      </Dropdown.SubmenuTrigger>
      <Dropdown.Content aria-label={label}>
        <Dropdown.Section>
          {options.map((option) => (
            <Dropdown.OptionItem
              key={option.value}
              selected={option.value === value}
              closeOnSelect={closeOnSelect}
              onSelect={() => onChange(option.value)}
            >
              {option.label}
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
      </Dropdown.Content>
    </Dropdown.Submenu>
  );
};

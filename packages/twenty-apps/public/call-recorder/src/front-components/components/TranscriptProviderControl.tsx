import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { Select } from 'twenty-ui/primitives/input';

import { EMPTY_OPTION_LABEL } from 'src/front-components/constants/empty-option-label.constant';

type TranscriptProviderControlProps = {
  value: string;
  options: { label: string; value: string }[];
  labelledBy: string;
  onChange: (value: string) => void;
};

export const TranscriptProviderControl = ({
  value,
  options,
  labelledBy,
  onChange,
}: TranscriptProviderControlProps) => (
  <Select.Root<string>
    items={options}
    value={isNonEmptyString(value) ? value : null}
    onValueChange={(nextValue, eventDetails) => {
      if (
        eventDetails.reason !== 'item-press' ||
        !isDefined(nextValue) ||
        nextValue === value
      ) {
        return;
      }

      onChange(nextValue);
    }}
  >
    <Select.Trigger size="sm" aria-labelledby={labelledBy}>
      <Select.Value placeholder={EMPTY_OPTION_LABEL} />
      <Select.Icon />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner
        align="end"
        sideOffset={4}
        alignItemWithTrigger={false}
      >
        <Select.Popup aria-labelledby={labelledBy}>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
);

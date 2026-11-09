import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Select } from 'twenty-ui/primitives/input';
import { AiChatAssistantMode } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

type SettingsAiBehaviorModeSelectProps = {
  value: AiChatAssistantMode | null;
  onChange: (value: AiChatAssistantMode) => void;
  labelledBy: string;
  describedBy: string;
  disabled: boolean;
  isLoading: boolean;
};

const StyledSelectContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SettingsAiBehaviorModeSelect = ({
  value,
  onChange,
  labelledBy,
  describedBy,
  disabled,
  isLoading,
}: SettingsAiBehaviorModeSelectProps) => {
  const { t } = useLingui();
  const options: { value: AiChatAssistantMode; label: string }[] = [
    { value: AiChatAssistantMode.NEVER, label: t`Never` },
    { value: AiChatAssistantMode.MENTION_ONLY, label: t`Only when mentioned` },
    { value: AiChatAssistantMode.AUTOMATIC, label: t`Auto` },
  ];

  return (
    <StyledSelectContainer>
      <Select.Root<AiChatAssistantMode>
        items={options}
        value={isLoading ? null : value}
        onValueChange={(nextValue, eventDetails) => {
          const isPickedFromOptions = eventDetails.reason === 'item-press';

          if (
            !isPickedFromOptions ||
            !isDefined(nextValue) ||
            nextValue === value
          ) {
            return;
          }

          onChange(nextValue);
        }}
        disabled={disabled}
      >
        <Select.Trigger
          size="sm"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          <Select.Value
            placeholder={isLoading ? t`Loading...` : t`Choose behavior`}
          />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            align="end"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <Select.Popup aria-labelledby={labelledBy}>
              {options.map(({ value: optionValue, label }) => (
                <Select.Item key={optionValue} value={optionValue}>
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </StyledSelectContainer>
  );
};

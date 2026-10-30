import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Select } from 'twenty-ui/primitives/input';
import { AiChatAssistantMode } from '~/generated-metadata/graphql';

type SettingsAiBehaviorModeSelectProps = {
  value: AiChatAssistantMode | null;
  onChange: (value: AiChatAssistantMode) => void;
  labelledBy: string;
  describedBy: string;
  disabled: boolean;
  isLoading: boolean;
  hasError: boolean;
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
  hasError,
}: SettingsAiBehaviorModeSelectProps) => {
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
        onValueChange={(nextValue) => {
          if (disabled || !isDefined(nextValue)) {
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
          aria-invalid={hasError || undefined}
        >
          <Select.Value
            placeholder={isLoading ? t`Loading...` : t`Choose behavior`}
          />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner align="end" sideOffset={4}>
            <Select.Popup>
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

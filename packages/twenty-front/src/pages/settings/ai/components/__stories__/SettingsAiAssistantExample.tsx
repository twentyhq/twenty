import { type ComponentProps, useState } from 'react';
import { DEFAULT_AI_CHAT_ASSISTANT_PROFILE } from 'twenty-shared/ai';
import { SettingsAiAssistantSection } from '~/pages/settings/ai/components/SettingsAiAssistantSection';

type SettingsAiAssistantExampleProps = ComponentProps<
  typeof SettingsAiAssistantSection
> & {
  shouldRejectChanges?: boolean;
};

export const SettingsAiAssistantExample = ({
  value,
  onChange,
  onReset,
  disabled,
  isSaving,
  errorMessage,
  shouldRejectChanges = false,
}: SettingsAiAssistantExampleProps) => {
  const [draftValue, setDraftValue] = useState(value);

  return (
    <SettingsAiAssistantSection
      value={draftValue}
      onChange={(nextValue) => {
        onChange(nextValue);

        if (!shouldRejectChanges) {
          setDraftValue((previousValue) => ({
            ...previousValue,
            ...nextValue,
          }));
        }
      }}
      onReset={() => {
        onReset();
        if (!shouldRejectChanges) {
          setDraftValue(DEFAULT_AI_CHAT_ASSISTANT_PROFILE);
        }
      }}
      disabled={disabled}
      isSaving={isSaving}
      errorMessage={errorMessage}
    />
  );
};

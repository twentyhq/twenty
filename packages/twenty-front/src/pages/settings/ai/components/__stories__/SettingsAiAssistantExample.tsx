import { type ComponentProps, useState } from 'react';
import { SettingsAiAssistantSection } from '~/pages/settings/ai/components/SettingsAiAssistantSection';

type SettingsAiAssistantExampleProps = ComponentProps<
  typeof SettingsAiAssistantSection
> & {
  shouldRejectChanges?: boolean;
};

export const SettingsAiAssistantExample = ({
  value,
  onChange,
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
      disabled={disabled}
      isSaving={isSaving}
      errorMessage={errorMessage}
    />
  );
};

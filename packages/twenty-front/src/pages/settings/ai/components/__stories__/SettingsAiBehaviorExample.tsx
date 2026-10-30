import { type ComponentProps, useState } from 'react';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

type SettingsAiBehaviorExampleProps = ComponentProps<
  typeof SettingsAiBehaviorSection
> & {
  shouldRejectChanges?: boolean;
};

export const SettingsAiBehaviorExample = ({
  directMessageMode,
  inboxMode,
  onDirectMessageModeChange,
  onInboxModeChange,
  isLoading,
  disabled,
  errorMessage,
  shouldRejectChanges = false,
}: SettingsAiBehaviorExampleProps) => {
  const [currentDirectMessageMode, setDirectMessageMode] =
    useState(directMessageMode);
  const [currentInboxMode, setInboxMode] = useState(inboxMode);

  return (
    <SettingsAiBehaviorSection
      directMessageMode={currentDirectMessageMode}
      inboxMode={currentInboxMode}
      onDirectMessageModeChange={(value) => {
        onDirectMessageModeChange(value);

        if (!shouldRejectChanges) {
          setDirectMessageMode(value);
        }
      }}
      onInboxModeChange={(value) => {
        onInboxModeChange(value);

        if (!shouldRejectChanges) {
          setInboxMode(value);
        }
      }}
      isLoading={isLoading}
      disabled={disabled}
      errorMessage={errorMessage}
    />
  );
};

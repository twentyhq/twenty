import { SettingsAiBehaviorExampleSyncEffect } from '~/pages/settings/ai/components/__stories__/SettingsAiBehaviorExampleSyncEffect';
import { type ComponentProps, useState } from 'react';
import { SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

type SettingsAiBehaviorExampleProps = ComponentProps<
  typeof SettingsAiBehaviorSection
> & {
  shouldRejectChanges?: boolean;
};

export const SettingsAiBehaviorExample = ({
  inboxMode,
  onInboxModeChange,
  isLoading,
  disabled,
  errorMessage,
  shouldRejectChanges = false,
}: SettingsAiBehaviorExampleProps) => {
  const [currentInboxMode, setInboxMode] = useState(inboxMode);

  return (
    <>
      <SettingsAiBehaviorExampleSyncEffect
        inboxMode={inboxMode}
        setInboxMode={setInboxMode}
      />
      <SettingsAiBehaviorSection
        inboxMode={currentInboxMode}
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
    </>
  );
};

import {
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
  useEffect,
} from 'react';
import { type SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

type SettingsAiBehaviorMode = ComponentProps<
  typeof SettingsAiBehaviorSection
>['inboxMode'];

type SettingsAiBehaviorExampleSyncEffectProps = {
  inboxMode: SettingsAiBehaviorMode;
  setInboxMode: Dispatch<SetStateAction<SettingsAiBehaviorMode>>;
};

export const SettingsAiBehaviorExampleSyncEffect = ({
  inboxMode,
  setInboxMode,
}: SettingsAiBehaviorExampleSyncEffectProps) => {
  useEffect(() => {
    setInboxMode(inboxMode);
  }, [inboxMode, setInboxMode]);

  return null;
};

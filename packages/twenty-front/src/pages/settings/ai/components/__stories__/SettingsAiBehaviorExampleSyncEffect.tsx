import {
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
  useEffect,
} from 'react';
import { type SettingsAiBehaviorSection } from '~/pages/settings/ai/components/SettingsAiBehaviorSection';

type SettingsAiBehaviorMode = ComponentProps<
  typeof SettingsAiBehaviorSection
>['directMessageMode'];

type SettingsAiBehaviorExampleSyncEffectProps = {
  directMessageMode: SettingsAiBehaviorMode;
  inboxMode: SettingsAiBehaviorMode;
  setDirectMessageMode: Dispatch<SetStateAction<SettingsAiBehaviorMode>>;
  setInboxMode: Dispatch<SetStateAction<SettingsAiBehaviorMode>>;
};

export const SettingsAiBehaviorExampleSyncEffect = ({
  directMessageMode,
  inboxMode,
  setDirectMessageMode,
  setInboxMode,
}: SettingsAiBehaviorExampleSyncEffectProps) => {
  useEffect(() => {
    setDirectMessageMode(directMessageMode);
  }, [directMessageMode, setDirectMessageMode]);

  useEffect(() => {
    setInboxMode(inboxMode);
  }, [inboxMode, setInboxMode]);

  return null;
};

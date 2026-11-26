import { type BrowserNotificationSetupStep } from '@/settings/experience/types/BrowserNotificationSetupStep';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const browserNotificationSetupStepState =
  createAtomState<BrowserNotificationSetupStep>({
    key: 'browserNotificationSetupStepState',
    defaultValue: 'allow',
  });

import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

export const isGettingStartedStepActionKey = (
  value: string,
): value is GettingStartedStepActionKey =>
  Object.values<string>(GettingStartedStepActionKey).includes(value);

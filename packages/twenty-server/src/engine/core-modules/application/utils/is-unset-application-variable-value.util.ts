import { isNonEmptyString } from '@sniptt/guards';

export const isUnsetApplicationVariableValue = (value: string): boolean =>
  !isNonEmptyString(value);

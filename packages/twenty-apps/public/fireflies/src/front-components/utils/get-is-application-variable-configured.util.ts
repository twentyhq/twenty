import { isNonEmptyString, isUndefined } from '@sniptt/guards';

export const getIsApplicationVariableConfigured = ({
  draftValue,
  storedValue,
}: {
  draftValue: string | undefined;
  storedValue: string | undefined;
}): boolean =>
  isUndefined(draftValue)
    ? isNonEmptyString(storedValue)
    : isNonEmptyString(draftValue);

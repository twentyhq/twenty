import { isNonEmptyString, isUndefined } from '@sniptt/guards';

export const getIsApplicationVariableConfigured = ({
  draftValue,
  savedValue,
  storedValue,
}: {
  draftValue: string | undefined;
  savedValue: string | undefined;
  storedValue: string | undefined;
}): boolean => {
  if (isUndefined(draftValue)) {
    return isNonEmptyString(storedValue);
  }

  return isNonEmptyString(draftValue) && draftValue === savedValue;
};

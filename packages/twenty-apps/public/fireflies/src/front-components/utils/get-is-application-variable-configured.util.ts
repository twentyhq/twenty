import { isNonEmptyString, isUndefined } from '@sniptt/guards';

// The draft value wins whenever the field has been edited in this session, so
// the answer reflects what is in the input rather than what was last saved.
// An undefined draft means untouched, which falls back to the stored value.
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

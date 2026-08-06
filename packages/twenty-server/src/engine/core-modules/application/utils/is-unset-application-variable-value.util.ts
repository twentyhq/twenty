import { isNonEmptyString } from '@sniptt/guards';

// '' is the unset sentinel both variable tables encode in their @Check
// constraint, and it is what `isFilled` and the required check read. Encrypting
// an empty value would produce a real envelope that wrongly reads as filled.
export const isUnsetApplicationVariableValue = (value: string): boolean =>
  !isNonEmptyString(value);

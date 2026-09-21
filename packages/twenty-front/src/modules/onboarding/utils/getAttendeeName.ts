import { isNonEmptyString } from '@sniptt/guards';

export const getAttendeeName = (
  nameParts:
    | { firstName?: string | null; lastName?: string | null }
    | null
    | undefined,
) =>
  [nameParts?.firstName, nameParts?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

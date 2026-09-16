import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/RESTRICTED_FIELD_PLACEHOLDER';

export const stripRestrictedFieldValue = (
  value: string | undefined,
): string | undefined =>
  value === RESTRICTED_FIELD_PLACEHOLDER ? undefined : value;

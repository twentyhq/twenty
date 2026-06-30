import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';

export const stripRestrictedFieldValue = (
  value: string | undefined,
): string | undefined =>
  value === RESTRICTED_FIELD_PLACEHOLDER ? undefined : value;

import { RESTRICTED_FIELD_PLACEHOLDER } from 'src/logic-functions/constants/restricted-field-placeholder';

export const stripRestrictedFieldValue = (
  value: string | null,
): string | null => (value === RESTRICTED_FIELD_PLACEHOLDER ? null : value);

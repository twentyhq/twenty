import { isString } from '@sniptt/guards';

import { FieldPhoneValue } from '../FieldMetadata';

// TODO: add zod
export const isFieldPhoneValue = (
  fieldValue: unknown,
): fieldValue is FieldPhoneValue => isString(fieldValue);

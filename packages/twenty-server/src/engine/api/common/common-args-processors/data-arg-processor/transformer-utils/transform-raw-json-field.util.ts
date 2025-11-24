//Json.parse() for RawJsonField is done in formatFieldMetadataValue in ORM
import { isNull } from '@sniptt/guards';

export const transformRawJsonField = (
  value: object | string | null,
  isNullEquivalenceEnabled: boolean = false,
): object | string | null => {
  return isNullEquivalenceEnabled &&
    !isNull(value) &&
    Object.keys(value).length === 0
    ? null
    : value;
};

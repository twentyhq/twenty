//Json.parse() for RawJsonField is done in formatFieldMetadataValue in ORM
import { isNullEquivalentRawJsonFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-raw-json-field-value.util';

export const transformRawJsonField = (
  value: object | string | null,
  isNullEquivalenceEnabled: boolean = false,
): object | string | null => {
  return isNullEquivalenceEnabled && isNullEquivalentRawJsonFieldValue(value)
    ? null
    : value;
};

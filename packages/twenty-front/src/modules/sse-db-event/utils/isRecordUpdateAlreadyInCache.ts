import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isFieldRawJson } from '@/object-record/record-field/ui/types/guards/isFieldRawJson';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { removeTypenamesFromCompositeFieldValue } from '@/object-record/utils/removeTypenamesFromCompositeFieldValue';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

const removeNullSubFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeNullSubFields);
  }

  if (!isDefined(value) || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, subValue]) => isDefined(subValue))
      .map(([key, subValue]) => [key, removeNullSubFields(subValue)]),
  );
};

// The server omits null sub-fields it never set, so a cached `{ provider: null }` equals an event's `{}`.
const normalizeCompositeValue = (value: unknown): unknown =>
  removeNullSubFields(removeTypenamesFromCompositeFieldValue(value));

// Fields the tab never fetched are undefined in the cache and carry no rendered state, so they cannot make the event new.
export const isRecordUpdateAlreadyInCache = ({
  cachedRecord,
  updatedRecord,
  objectMetadataItem,
}: {
  cachedRecord: ObjectRecord;
  updatedRecord: Record<string, unknown>;
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
}): boolean => {
  // Null properties and __typename keys are user data in a raw JSON value, so those are compared as is.
  const rawJsonFieldNames = new Set(
    objectMetadataItem.fields
      .filter(isFieldRawJson)
      .map((fieldMetadataItem) => fieldMetadataItem.name),
  );

  return Object.entries(updatedRecord).every(([fieldName, updatedValue]) => {
    if (fieldName === '__typename' || cachedRecord[fieldName] === undefined) {
      return true;
    }

    if (rawJsonFieldNames.has(fieldName)) {
      return fastDeepEqual(cachedRecord[fieldName], updatedValue);
    }

    return fastDeepEqual(
      normalizeCompositeValue(cachedRecord[fieldName]),
      normalizeCompositeValue(updatedValue),
    );
  });
};

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

// Apollo adds __typename to cached composites and the server omits null sub-fields it never set, so both are ignored.
const normalizeFieldValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeFieldValue);
  }

  if (!isDefined(value) || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, subValue]) => key !== '__typename' && isDefined(subValue))
      .map(([key, subValue]) => [key, normalizeFieldValue(subValue)]),
  );
};

// Fields the tab never fetched are undefined in the cache and carry no rendered state, so they cannot make the event new.
export const isRecordUpdateAlreadyInCache = ({
  cachedRecord,
  updatedRecord,
}: {
  cachedRecord: ObjectRecord;
  updatedRecord: Record<string, unknown>;
}): boolean =>
  Object.entries(updatedRecord).every(
    ([fieldName, updatedValue]) =>
      fieldName === '__typename' ||
      cachedRecord[fieldName] === undefined ||
      fastDeepEqual(
        normalizeFieldValue(cachedRecord[fieldName]),
        normalizeFieldValue(updatedValue),
      ),
  );

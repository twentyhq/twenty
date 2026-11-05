import { isPlainObject } from 'twenty-shared/utils';

export const isRecordFieldValueLoaded = ({
  record,
  fieldPath,
}: {
  record: Record<string, unknown>;
  fieldPath: string;
}): boolean => {
  let value: unknown = record;

  for (const segment of fieldPath.split('.')) {
    if (!isPlainObject(value) || !(segment in value)) {
      return false;
    }

    value = value[segment];
  }

  return true;
};

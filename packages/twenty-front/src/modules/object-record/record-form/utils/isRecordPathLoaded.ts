import { isPlainObject } from 'twenty-shared/utils';

export const isRecordPathLoaded = ({
  record,
  path,
}: {
  record: Record<string, unknown>;
  path: string;
}): boolean => {
  let value: unknown = record;

  for (const segment of path.split('.')) {
    if (!isPlainObject(value) || !(segment in value)) {
      return false;
    }

    value = value[segment];
  }

  return true;
};

import { isPlainObject } from 'twenty-shared/utils';

// frozen copy of twenty-shared's isBaseOutputSchemaV2 as of 2.57, so this command keeps its rule
export const isStoredOutputSchema = (
  value: unknown,
): value is Record<string, unknown> =>
  isPlainObject(value) &&
  Object.keys(value).length > 0 &&
  Object.values(value).every(
    (entry) => isPlainObject(entry) && typeof entry.isLeaf === 'boolean',
  );

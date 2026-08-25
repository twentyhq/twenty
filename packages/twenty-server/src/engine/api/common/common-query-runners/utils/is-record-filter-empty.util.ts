import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// A filter with no keys yields no WHERE clause: the query parser skips filtering entirely.
export const isRecordFilterEmpty = (
  filter: Partial<ObjectRecordFilter>,
): boolean => Object.keys(filter).length === 0;

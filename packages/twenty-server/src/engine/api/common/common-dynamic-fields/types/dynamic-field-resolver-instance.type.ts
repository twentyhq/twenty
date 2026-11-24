import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type DynamicFieldResolverInstance<TContext = unknown> = {
  readonly objectUniversalIdentifier: string;
  readonly sourceColumnNames: readonly string[];
  loadContext(args: { workspaceId: string }): Promise<TContext>;
  computeValues(args: {
    record: ObjectRecord;
    context: TContext;
  }): Partial<ObjectRecord>;
  computeSourceFilter(args: {
    dynamicFieldName: string;
    dynamicFieldFilter: Record<string, unknown>;
    context: TContext;
  }): ObjectRecordFilter;
};

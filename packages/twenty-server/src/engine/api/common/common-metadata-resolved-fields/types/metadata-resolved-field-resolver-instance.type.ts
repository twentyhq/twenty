import { type LeafFilter, type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type MetadataResolvedFieldResolverInstance<
  TContext = unknown,
  TMetadataResolvedFieldFilter extends NonNullable<LeafFilter> =
    NonNullable<LeafFilter>,
> = {
  readonly objectUniversalIdentifier: string;
  readonly sourceColumnNames: readonly string[];
  loadContext(args: { workspaceId: string }): Promise<TContext>;
  computeValues(args: {
    record: ObjectRecord;
    context: TContext;
  }): Partial<ObjectRecord>;
  computeSourceFilter(args: {
    metadataResolvedFieldName: string;
    metadataResolvedFieldFilter: TMetadataResolvedFieldFilter;
    context: TContext;
  }): ObjectRecordFilter;
};

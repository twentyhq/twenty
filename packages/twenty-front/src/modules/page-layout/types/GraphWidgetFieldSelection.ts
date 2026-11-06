import {
  type AggregateOperations,
  type GraphOrderBy,
} from '~/generated-metadata/graphql';

export type GraphWidgetFieldSelection = {
  objectMetadataId: string;
  aggregateFieldMetadataId?: string;
  aggregateOperation: AggregateOperations;
  groupByFieldMetadataId?: string;
  groupByOrderBy?: GraphOrderBy;
};

import { type AggregateOperations } from '~/generated-metadata/graphql';

export type RecordField = {
  id: string;
  fieldMetadataItemId: string;
  position: number;
  isVisible: boolean;
  isCanonical?: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
  relationTargetFieldMetadataId?: string | null;
};

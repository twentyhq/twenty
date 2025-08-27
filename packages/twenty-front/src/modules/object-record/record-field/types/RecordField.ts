import { type AggregateOperations } from '~/generated/graphql';

export type RecordField = {
  id: string;
  fieldMetadataItemId: string;
  position: number;
  isVisible: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
};

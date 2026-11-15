import { type ViewFieldSettings } from 'twenty-shared/types';
import { type AggregateOperations } from '~/generated-metadata/graphql';

export type RecordField = {
  id: string;
  fieldMetadataItemId: string;
  position: number;
  isVisible: boolean;
  isCanonical?: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
  settings?: ViewFieldSettings | null;
  relationTargetFieldMetadataId?: string | null;
};

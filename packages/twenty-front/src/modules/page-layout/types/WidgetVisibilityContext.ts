import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from 'twenty-shared/types';

export type WidgetVisibilityContext = ConditionalDisplayEvaluationContext & {
  selectedRecords: ObjectRecord[];
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  // TODO: remove with the workspace workflow and workflowVersion objects once the core migration owns them.
  hiddenFieldMetadataIdsOrNames?: string[];
};

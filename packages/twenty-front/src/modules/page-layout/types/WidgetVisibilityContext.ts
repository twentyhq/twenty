import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ConditionalDisplayDevice } from 'twenty-shared/types';

export type WidgetVisibilityContext = {
  device: ConditionalDisplayDevice;
  selectedRecords: Record<string, unknown>[];
  featureFlags: Record<string, boolean>;
  currentRoleId: string | null;
  currentWorkspaceMemberId: string | null;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  // TODO: remove with the workspace workflow and workflowVersion objects once the core migration owns them.
  hiddenFieldMetadataIdsOrNames?: string[];
};

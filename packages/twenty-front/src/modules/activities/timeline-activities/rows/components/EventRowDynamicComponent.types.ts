import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type EventRowDynamicComponentProps = {
  labelIdentifierValue: string;
  event: TimelineActivity;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
  authorFullName: string;
  createdAt?: string;
};

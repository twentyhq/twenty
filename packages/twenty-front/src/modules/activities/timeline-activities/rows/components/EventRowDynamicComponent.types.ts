import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type EventRowDynamicComponentProps = {
  labelIdentifierValue: string;
  event: TimelineActivity;
  eventAction: TimelineActivityAction | null;
  eventTypeLabel?: string;
  frontComponentId?: string | null;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
  authorFullName: string;
  happensAt?: string;
};

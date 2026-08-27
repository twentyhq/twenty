import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type TimelineActivityRenderer } from '@/activities/timeline-activities/rows/components/TimelineActivityRenderer';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type EventRowNativeComponentProps = {
  labelIdentifierValue: string;
  event: TimelineActivity;
  eventAction: TimelineActivityAction | null;
  eventTypeLabel?: string;
  hasRenderer?: boolean;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
  authorFullName: string;
  happensAt?: string;
};

export type EventRowDynamicComponentProps = Omit<
  EventRowNativeComponentProps,
  'hasRenderer'
> & {
  renderer: TimelineActivityRenderer | null;
};

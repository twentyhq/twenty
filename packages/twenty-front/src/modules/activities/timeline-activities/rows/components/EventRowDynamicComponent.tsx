import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { TIMELINE_ACTIVITY_PRESENTERS } from '@/activities/timeline-activities/rows/registry/timelineActivityPresenters';
import { resolveTimelineActivityDescriptor } from 'twenty-shared/timeline';

export const EventRowDynamicComponent = (
  props: EventRowDynamicComponentProps,
) => {
  const { event, linkedObjectMetadataItem } = props;

  const { kind } = resolveTimelineActivityDescriptor({
    kind: event.kind,
    name: event.name,
    linkedObjectNameSingular: linkedObjectMetadataItem?.nameSingular,
  });

  return TIMELINE_ACTIVITY_PRESENTERS[kind].renderRow(props);
};

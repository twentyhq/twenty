import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { getTimelineActivityLinkedPresenter } from '@/activities/timeline-activities/rows/registry/timelineActivityPresenters';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { isDefined } from 'twenty-shared/utils';

export const EventRowDynamicComponent = (
  props: EventRowDynamicComponentProps,
) => {
  const { linkedObjectMetadataItem } = props;

  if (isDefined(linkedObjectMetadataItem)) {
    return getTimelineActivityLinkedPresenter(
      linkedObjectMetadataItem.nameSingular,
    ).renderRow(props);
  }

  return (
    <EventRowMainObject
      labelIdentifierValue={props.labelIdentifierValue}
      event={props.event}
      mainObjectMetadataItem={props.mainObjectMetadataItem}
      linkedObjectMetadataItem={props.linkedObjectMetadataItem}
      authorFullName={props.authorFullName}
      createdAt={props.createdAt}
    />
  );
};

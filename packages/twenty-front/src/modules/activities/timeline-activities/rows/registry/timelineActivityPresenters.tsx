import { type ReactNode } from 'react';

import { EventRowActivity } from '@/activities/timeline-activities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventRowCalendarEvent';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMessage } from '@/activities/timeline-activities/rows/message/components/EventRowMessage';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export type TimelineActivityLinkedPresenter = {
  renderRow: (props: EventRowDynamicComponentProps) => ReactNode;
};

export const TIMELINE_ACTIVITY_LINKED_PRESENTERS: Partial<
  Record<string, TimelineActivityLinkedPresenter>
> = {
  message: {
    renderRow: ({
      labelIdentifierValue,
      event,
      mainObjectMetadataItem,
      linkedObjectMetadataItem,
      authorFullName,
    }) => (
      <EventRowMessage
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
      />
    ),
  },
  calendarEvent: {
    renderRow: ({
      labelIdentifierValue,
      event,
      mainObjectMetadataItem,
      linkedObjectMetadataItem,
      authorFullName,
    }) => (
      <EventRowCalendarEvent
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
      />
    ),
  },
  note: {
    renderRow: ({
      labelIdentifierValue,
      event,
      mainObjectMetadataItem,
      linkedObjectMetadataItem,
      authorFullName,
      createdAt,
    }) => (
      <EventRowActivity
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
        createdAt={createdAt}
        objectNameSingular={CoreObjectNameSingular.Note}
      />
    ),
  },
  task: {
    renderRow: ({
      labelIdentifierValue,
      event,
      mainObjectMetadataItem,
      linkedObjectMetadataItem,
      authorFullName,
      createdAt,
    }) => (
      <EventRowActivity
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
        createdAt={createdAt}
        objectNameSingular={CoreObjectNameSingular.Task}
      />
    ),
  },
};

export const GENERIC_LINKED_PRESENTER: TimelineActivityLinkedPresenter = {
  renderRow: ({
    labelIdentifierValue,
    event,
    mainObjectMetadataItem,
    linkedObjectMetadataItem,
    authorFullName,
    createdAt,
  }) => (
    <EventRowGenericLinked
      labelIdentifierValue={labelIdentifierValue}
      event={event}
      mainObjectMetadataItem={mainObjectMetadataItem}
      linkedObjectMetadataItem={linkedObjectMetadataItem}
      authorFullName={authorFullName}
      createdAt={createdAt}
    />
  ),
};

export const getTimelineActivityLinkedPresenter = (
  linkedObjectNameSingular: string,
): TimelineActivityLinkedPresenter =>
  TIMELINE_ACTIVITY_LINKED_PRESENTERS[linkedObjectNameSingular] ??
  GENERIC_LINKED_PRESENTER;

import { type ReactNode } from 'react';

import { EventRowActivity } from '@/activities/timeline-activities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventRowCalendarEvent';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timeline-activities/rows/message/components/EventRowMessage';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type TimelineActivityKind } from 'twenty-shared/timeline';

export type TimelineActivityPresenter = {
  renderRow: (props: EventRowDynamicComponentProps) => ReactNode;
  needsLinkedRecordTitle?: boolean;
};

export const TIMELINE_ACTIVITY_PRESENTERS: Record<
  TimelineActivityKind,
  TimelineActivityPresenter
> = {
  recordChange: {
    renderRow: ({
      labelIdentifierValue,
      event,
      mainObjectMetadataItem,
      linkedObjectMetadataItem,
      authorFullName,
      createdAt,
    }) => (
      <EventRowMainObject
        labelIdentifierValue={labelIdentifierValue}
        event={event}
        mainObjectMetadataItem={mainObjectMetadataItem}
        linkedObjectMetadataItem={linkedObjectMetadataItem}
        authorFullName={authorFullName}
        createdAt={createdAt}
      />
    ),
  },
  linkedMessage: {
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
  linkedCalendarEvent: {
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
  linkedNote: {
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
    needsLinkedRecordTitle: true,
  },
  linkedTask: {
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
    needsLinkedRecordTitle: true,
  },
  linkedRecord: {
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
  },
};

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
    renderRow: (props) => <EventRowMainObject {...props} />,
  },
  linkedMessage: {
    renderRow: (props) => <EventRowMessage {...props} />,
  },
  linkedCalendarEvent: {
    renderRow: (props) => <EventRowCalendarEvent {...props} />,
  },
  linkedNote: {
    renderRow: (props) => (
      <EventRowActivity
        {...props}
        objectNameSingular={CoreObjectNameSingular.Note}
      />
    ),
    needsLinkedRecordTitle: true,
  },
  linkedTask: {
    renderRow: (props) => (
      <EventRowActivity
        {...props}
        objectNameSingular={CoreObjectNameSingular.Task}
      />
    ),
    needsLinkedRecordTitle: true,
  },
  linkedRecord: {
    renderRow: (props) => <EventRowGenericLinked {...props} />,
  },
};

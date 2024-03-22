import { ReactElement } from 'react';

import { EventRow } from '@/activities/events/components/EventRow';
import { Event } from '@/activities/events/types/Event';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

type EventListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  events: Event[];
  button?: ReactElement | false;
};

export const EventList = ({ events }: EventListProps) => {
  return (
    <>
      {events &&
        events.length > 0 &&
        events.map((event: Event) => <EventRow key={event.id} event={event} />)}
    </>
  );
};

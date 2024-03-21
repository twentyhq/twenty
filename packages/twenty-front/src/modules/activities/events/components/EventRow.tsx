import { Event } from '@/activities/events/types/Event';

export const EventRow = ({ event }: { event: Event }) => {
  return (
    <p>
      {event.name}: {JSON.stringify(event.properties)}
    </p>
  );
};

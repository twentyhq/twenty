import { Event } from '@/activities/events/types/Event';

export const EventRow = ({ event }: { event: Event }) => {
  return (
    <>
      <p>{JSON.stringify(event)}</p>
      <p>
        {event.name}:<pre>{event.properties}</pre>
      </p>
    </>
  );
};

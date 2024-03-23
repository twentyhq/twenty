import { isNonEmptyArray } from '@sniptt/guards';

import { EventList } from '@/activities/events/components/EventList';
import { useEvents } from '@/activities/events/hooks/useEvents';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const Events = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { events } = useEvents(targetableObject);

  if (!isNonEmptyArray(events)) {
    return <div>No log yet</div>;
  }

  return (
    <EventList
      targetableObject={targetableObject}
      title="All"
      events={events ?? []}
    />
  );
};

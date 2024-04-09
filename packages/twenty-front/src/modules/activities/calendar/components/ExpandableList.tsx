import React, { useState } from 'react';

import { CalendarEventParticipantPlus } from '@/activities/calendar/components/CalendarEventParticipantPlus';
import { IntersectionObserverWrapper } from '@/activities/calendar/components/IntersectionObserverWrapper';

export const ExpandableList = ({
  components,
  rootRef,
  margin,
}: {
  components: React.ReactNode[];
  rootRef: React.RefObject<HTMLElement>;
  margin?: string;
}) => {
  const [componentsInView, setComponentsInView] = useState(new Set<number>());

  const firstComponent = components[0];

  return (
    <>
      {firstComponent}
      {components.slice(1).map((component, index) => (
        <React.Fragment key={index}>
          <IntersectionObserverWrapper
            set={setComponentsInView}
            id={index}
            rootRef={rootRef}
            margin={margin}
          >
            {component}
          </IntersectionObserverWrapper>
          {index === componentsInView.size &&
            components.length - componentsInView.size - 1 !== 0 && (
              <CalendarEventParticipantPlus
                number={components.length - componentsInView.size - 1}
              />
            )}{' '}
        </React.Fragment>
      ))}
      {components.length - componentsInView.size - 1 !== 0 && (
        <CalendarEventParticipantPlus
          number={components.length - componentsInView.size - 1}
        />
      )}
    </>
  );
};

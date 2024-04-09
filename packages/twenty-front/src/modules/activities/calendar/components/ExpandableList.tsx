import React, { ReactElement, useState } from 'react';

import { ExpandableListPlus } from '@/activities/calendar/components/ExpandableListPlus';
import { IntersectionObserverWrapper } from '@/activities/calendar/components/IntersectionObserverWrapper';

export const ExpandableList = ({
  components,
  rootRef,
  margin,
}: {
  components: ReactElement[];
  rootRef: React.RefObject<HTMLElement>;
  margin?: string;
}) => {
  const [componentsInView, setComponentsInView] = useState(new Set<number>());

  const firstComponent = components[0];

  return (
    <>
      {firstComponent && React.cloneElement(firstComponent, { inView: true })}
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
          {index === componentsInView.size - 1 &&
            components.length - componentsInView.size - 1 !== 0 && (
              <ExpandableListPlus
                number={components.length - componentsInView.size - 1}
              />
            )}
        </React.Fragment>
      ))}
    </>
  );
};

const ExpendableCell = ({
  children,
  isExpanded,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
}) => {
  return (
    <div style={{ display: isExpanded ? 'block' : 'none' }}>{children}</div>
  );
};

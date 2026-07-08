import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const DivFocusinFrontComponent = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { entries, pushEvent } = useEventLog();

  useEffect(() => {
    const container = containerRef.current;
    if (!isDefined(container)) {
      return;
    }

    const handleFocusEvent = (event: Event) => {
      pushEvent(event as unknown as SyntheticEvent<Element>);
    };

    container.addEventListener('focusin', handleFocusEvent);
    container.addEventListener('focusout', handleFocusEvent);
    setIsListening(true);

    return () => {
      container.removeEventListener('focusin', handleFocusEvent);
      container.removeEventListener('focusout', handleFocusEvent);
    };
  }, [pushEvent]);

  return (
    <FrontComponentCard title="div:focusin">
      <div data-testid="container" ref={containerRef}>
        <input data-testid="subject" placeholder="focus me" />
      </div>
      <span data-testid="front-component-value">
        {isListening ? 'ready' : 'pending'}
      </span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-div-focusin-00000000-0000-0000-0000-000000000020',
  name: 'div-focusin-front-component',
  description:
    'Front component covering focusin and focusout listeners on <div>',
  component: DivFocusinFrontComponent,
});

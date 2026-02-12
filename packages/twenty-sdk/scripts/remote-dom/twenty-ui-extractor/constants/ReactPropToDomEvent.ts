import { EVENT_TO_REACT } from '@/sdk/front-component-common/EventToReact';

export const REACT_PROP_TO_DOM_EVENT: Record<string, string> =
  Object.fromEntries(
    Object.entries(EVENT_TO_REACT).map(([domEvent, reactProp]) => [
      reactProp,
      domEvent,
    ]),
  );

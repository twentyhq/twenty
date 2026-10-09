import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';

// Both spellings are indexed: dblclick arrives as ondblclick or onDoubleClick.
export const LOWERCASE_EVENT_PROP_TO_DOM_EVENT_TYPE: Record<string, string> =
  Object.fromEntries(
    Object.entries(DOM_EVENT_TYPE_TO_REACT_PROP).flatMap(
      ([domEventType, reactProp]) => [
        [`on${domEventType}`, domEventType],
        [reactProp.toLowerCase(), domEventType],
      ],
    ),
  );

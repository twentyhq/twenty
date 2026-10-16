import { CAPTURE_PHASE_PROP_NAME_SUFFIX } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/capture-phase-prop-name-suffix';
import { type EventListenerDescriptor } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-descriptor.type';
import { isCapturePhaseEventProp } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-capture-phase-event-prop';
import { resolveTextInputChangeEventType } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/resolve-text-input-change-event-type';

const EVENT_PROP_NAME_PREFIX = 'on';
const DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME: Record<
  string,
  string
> = {
  ondoubleclick: 'ondblclick',
};

export const toEventListenerDescriptor = ({
  eventPropName,
  element,
}: {
  eventPropName: string;
  element: EventTarget;
}): EventListenerDescriptor => {
  const isCapturePhase = isCapturePhaseEventProp(eventPropName);
  const bubblePhaseEventPropName = isCapturePhase
    ? eventPropName.slice(0, -CAPTURE_PHASE_PROP_NAME_SUFFIX.length)
    : eventPropName;
  const lowerCaseEventPropName = bubblePhaseEventPropName.toLowerCase();
  const domEventPropName =
    DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME[
      lowerCaseEventPropName
    ] || lowerCaseEventPropName;
  const sourceEventType = domEventPropName.slice(EVENT_PROP_NAME_PREFIX.length);
  const eventType =
    sourceEventType === 'change'
      ? resolveTextInputChangeEventType(element)
      : sourceEventType;
  const eventKey =
    eventType === sourceEventType
      ? eventType
      : `${sourceEventType}:${eventType}`;

  return {
    key: isCapturePhase ? eventKey + ':capture' : eventKey,
    type: eventType,
    capture: isCapturePhase,
  };
};

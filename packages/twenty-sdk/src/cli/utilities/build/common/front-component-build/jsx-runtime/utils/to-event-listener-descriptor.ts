import { CAPTURE_PHASE_PROP_NAME_SUFFIX } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/constants/capture-phase-prop-name-suffix';
import { type EventListenerDescriptor } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-listener-descriptor.type';
import { isCapturePhaseEventProp } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-capture-phase-event-prop';

const EVENT_PROP_NAME_PREFIX = 'on';
const DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME: Record<
  string,
  string
> = {
  ondoubleclick: 'ondblclick',
};

export const toEventListenerDescriptor = (
  eventPropName: string,
): EventListenerDescriptor => {
  const isCapturePhase = isCapturePhaseEventProp(eventPropName);
  const bubblePhaseEventPropName = isCapturePhase
    ? eventPropName.slice(0, -CAPTURE_PHASE_PROP_NAME_SUFFIX.length)
    : eventPropName;
  const lowerCaseEventPropName = bubblePhaseEventPropName.toLowerCase();
  const domEventPropName =
    DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME[
      lowerCaseEventPropName
    ] || lowerCaseEventPropName;
  const eventType = domEventPropName.slice(EVENT_PROP_NAME_PREFIX.length);

  return {
    key: isCapturePhase ? eventType + ':capture' : eventType,
    type: eventType,
    capture: isCapturePhase,
  };
};

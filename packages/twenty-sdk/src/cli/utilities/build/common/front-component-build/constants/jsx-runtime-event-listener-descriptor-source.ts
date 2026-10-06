export const JSX_RUNTIME_EVENT_LISTENER_DESCRIPTOR_SOURCE = `
const EVENT_PROP_NAME_PREFIX = 'on';
const CAPTURE_PHASE_PROP_NAME_SUFFIX = 'Capture';
const POINTER_CAPTURE_EVENT_PROP_NAME_SUFFIX = 'PointerCapture';
const DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME = {
  ondoubleclick: 'ondblclick',
};

function isCapturePhaseEventProp(eventPropName) {
  return (
    eventPropName.endsWith(CAPTURE_PHASE_PROP_NAME_SUFFIX) &&
    !eventPropName.endsWith(POINTER_CAPTURE_EVENT_PROP_NAME_SUFFIX)
  );
}

function toEventListenerDescriptor(eventPropName) {
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
}
`.trim();

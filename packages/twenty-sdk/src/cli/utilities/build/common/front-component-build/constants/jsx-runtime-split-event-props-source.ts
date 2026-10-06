export const JSX_RUNTIME_SPLIT_EVENT_PROPS_SOURCE = `
const EVENT_PROP_NAME_PATTERN = /^on[A-Z]/;

function splitEventProps(props) {
  const cleanProps = {};
  let events = null;
  for (const propName in props) {
    const propValue = props[propName];
    const isEventHandlerProp =
      EVENT_PROP_NAME_PATTERN.test(propName) && typeof propValue === 'function';

    if (!isEventHandlerProp) {
      cleanProps[propName] = propValue;
      continue;
    }

    events = events || {};
    events[propName] = propValue;
  }
  return { cleanProps, events };
}
`.trim();

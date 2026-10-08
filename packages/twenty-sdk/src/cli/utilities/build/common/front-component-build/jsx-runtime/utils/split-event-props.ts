import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { isEventHandlerProp } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/is-event-handler-prop';

export const splitEventProps = (props: ElementProps | null | undefined) => {
  const cleanProps: ElementProps = {};
  let events: EventHandlersByPropName | null = null;
  for (const propName in props) {
    const propValue = props[propName];
    if (!isEventHandlerProp(propName, propValue)) {
      cleanProps[propName] = propValue;
      continue;
    }

    events = events || {};
    events[propName] = propValue;
  }
  return { cleanProps, events };
};

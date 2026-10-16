import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { isJsxEventPropOverriddenByClone } from '@/front-component-renderer/build/jsx-runtime/utils/is-jsx-event-prop-overridden-by-clone';

export const getJsxEventPropNamesOverriddenByClone = ({
  jsxEventHandlers,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  jsxEventHandlers: EventHandlersByPropName;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}) =>
  Object.keys(jsxEventHandlers).filter((jsxEventPropName) =>
    isJsxEventPropOverriddenByClone({
      eventPropName: jsxEventPropName,
      cloneConfig,
      eventHandlersSetByInnerClones,
    }),
  );

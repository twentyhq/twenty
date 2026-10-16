import { type ElementProps } from '@/app/bundles/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/app/bundles/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { isJsxEventPropOverriddenByClone } from '@/app/bundles/front-component-build/jsx-runtime/utils/is-jsx-event-prop-overridden-by-clone';

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

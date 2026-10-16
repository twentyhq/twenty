import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/front-component-renderer/build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { doesCloneSetOrClearEventProp } from '@/front-component-renderer/build/jsx-runtime/utils/does-clone-set-or-clear-event-prop';

export const isJsxEventPropOverriddenByClone = ({
  eventPropName,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  eventPropName: string;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}) => {
  if (doesCloneSetOrClearEventProp(cloneConfig, eventPropName)) {
    return true;
  }

  if (eventHandlersSetByInnerClones === null) {
    return false;
  }

  return eventPropName in eventHandlersSetByInnerClones;
};

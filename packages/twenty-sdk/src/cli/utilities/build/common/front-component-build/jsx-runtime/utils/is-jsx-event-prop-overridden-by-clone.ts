import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { type EventHandlersByPropName } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-handlers-by-prop-name.type';
import { doesCloneSetOrClearEventProp } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/does-clone-set-or-clear-event-prop';

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

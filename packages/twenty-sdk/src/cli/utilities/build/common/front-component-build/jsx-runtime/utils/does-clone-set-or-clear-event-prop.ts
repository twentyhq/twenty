import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';

export const doesCloneSetOrClearEventProp = (
  cloneConfig: ElementProps,
  eventPropName: string,
) => {
  const isEventPropInCloneConfig = eventPropName in cloneConfig;
  if (!isEventPropInCloneConfig) {
    return false;
  }

  const cloneEventPropValue = cloneConfig[eventPropName];
  const setsEventHandler = typeof cloneEventPropValue === 'function';
  const clearsEventHandler =
    cloneEventPropValue === null || cloneEventPropValue === undefined;
  return setsEventHandler || clearsEventHandler;
};

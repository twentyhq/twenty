import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';

export const doesCloneConfigSetEventProp = (
  config: ElementProps,
  eventPropName: string,
) => {
  if (!(eventPropName in config)) {
    return false;
  }

  const eventPropValue = config[eventPropName];
  return typeof eventPropValue === 'function' || eventPropValue == null;
};

import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { makeEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/make-event-ref';
import { splitEventProps } from '@/front-component-renderer/build/jsx-runtime/utils/split-event-props';

export const withJsxEventRef = (props: ElementProps | null | undefined) => {
  const { cleanProps, events } = splitEventProps(props);
  return Object.assign(cleanProps, {
    ref: makeEventRef(events, cleanProps.ref, 'jsx'),
  });
};

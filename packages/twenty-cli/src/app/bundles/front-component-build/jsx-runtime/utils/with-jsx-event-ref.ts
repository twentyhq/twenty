import { type ElementProps } from '@/app/bundles/front-component-build/jsx-runtime/types/element-props.type';
import { makeEventRef } from '@/app/bundles/front-component-build/jsx-runtime/utils/make-event-ref';
import { splitEventProps } from '@/app/bundles/front-component-build/jsx-runtime/utils/split-event-props';

export const withJsxEventRef = (props: ElementProps | null | undefined) => {
  const { cleanProps, events } = splitEventProps(props);
  return Object.assign(cleanProps, {
    ref: makeEventRef(events, cleanProps.ref, 'jsx'),
  });
};

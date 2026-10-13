import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { makeEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-event-ref';
import { splitEventProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/split-event-props';

export const withJsxEventRef = (props: ElementProps | null | undefined) => {
  const { cleanProps, events } = splitEventProps(props);
  return Object.assign(cleanProps, {
    ref: makeEventRef(events, cleanProps.ref, 'jsx'),
  });
};

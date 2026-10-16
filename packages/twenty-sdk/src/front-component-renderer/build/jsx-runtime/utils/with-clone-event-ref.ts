import { type ClonedElement } from '@/front-component-renderer/build/jsx-runtime/types/cloned-element.type';
import { type ElementProps } from '@/front-component-renderer/build/jsx-runtime/types/element-props.type';
import { doesCloneReplaceElementRef } from '@/front-component-renderer/build/jsx-runtime/utils/does-clone-replace-element-ref';
import { getElementRef } from '@/front-component-renderer/build/jsx-runtime/utils/get-element-ref';
import { makeCloneEventRef } from '@/front-component-renderer/build/jsx-runtime/utils/make-clone-event-ref';
import { splitEventProps } from '@/front-component-renderer/build/jsx-runtime/utils/split-event-props';

export const withCloneEventRef = (
  element: ClonedElement,
  config: ElementProps | null | undefined,
  readsElementRefFromVnode: boolean,
) => {
  const cloneConfig: ElementProps = config ?? {};
  const { cleanProps: cleanCloneConfig, events: cloneEvents } =
    splitEventProps(cloneConfig);
  const elementRef = getElementRef(element, readsElementRefFromVnode);
  return Object.assign(cleanCloneConfig, {
    ref: makeCloneEventRef({
      elementRef,
      cloneConfig,
      replacesElementRef: doesCloneReplaceElementRef(cloneConfig, elementRef),
      cloneEvents,
    }),
  });
};

import { type ClonedElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/cloned-element.type';
import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { doesCloneReplaceElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/does-clone-replace-element-ref';
import { getElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-element-ref';
import { makeCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref';
import { splitEventProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/split-event-props';

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
      replacesElementUserRef: doesCloneReplaceElementRef(
        cloneConfig,
        elementRef,
      ),
      cloneEvents,
    }),
  });
};

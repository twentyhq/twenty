import { type ClonedElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/cloned-element.type';
import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { doesCloneConfigReplaceElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/does-clone-config-replace-element-ref';
import { getElementRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/get-element-ref';
import { makeCloneEventRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/make-clone-event-ref';
import { splitEventProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/split-event-props';

export const withCloneEventRef = (
  element: ClonedElement,
  config: ElementProps | null | undefined,
  readsElementRefFromVnode: boolean,
) => {
  const { cleanProps: cleanConfig, events: cloneEvents } =
    splitEventProps(config);
  const elementRef = getElementRef(element, readsElementRefFromVnode);
  return Object.assign(cleanConfig, {
    ref: makeCloneEventRef({
      elementRef,
      config: config ?? {},
      replacesElementUserRef: doesCloneConfigReplaceElementRef(
        config,
        elementRef,
      ),
      cloneEvents,
    }),
  });
};

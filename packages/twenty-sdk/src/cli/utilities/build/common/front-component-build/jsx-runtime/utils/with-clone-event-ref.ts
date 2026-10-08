import { type ClonedElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/cloned-element.type';
import { type ElementProps } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/element-props.type';
import { doesCloneConfigOverrideRef } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/utils/does-clone-config-override-ref';
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
  return Object.assign(cleanConfig, {
    ref: makeCloneEventRef({
      elementRef: getElementRef(element, readsElementRefFromVnode),
      configRef: config == null ? undefined : config.ref,
      overridesElementRef: doesCloneConfigOverrideRef(
        config,
        readsElementRefFromVnode,
      ),
      cloneEvents,
    }),
  });
};

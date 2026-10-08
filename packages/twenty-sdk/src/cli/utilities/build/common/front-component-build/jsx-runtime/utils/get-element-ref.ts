import { type ClonedElement } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/cloned-element.type';

export const getElementRef = (
  element: ClonedElement,
  readsElementRefFromVnode: boolean,
) => {
  if (readsElementRefFromVnode) {
    return element.ref;
  }

  return element.props.ref;
};

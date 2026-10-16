import { type ClonedElement } from '@/front-component-renderer/build/jsx-runtime/types/cloned-element.type';

export const getElementRef = (
  element: ClonedElement,
  readsElementRefFromVnode: boolean,
) => {
  if (readsElementRefFromVnode) {
    return element.ref;
  }

  return element.props.ref;
};

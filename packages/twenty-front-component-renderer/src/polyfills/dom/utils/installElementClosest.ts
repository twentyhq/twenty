import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const matchesElementSelector = ({
  element,
  selector,
}: {
  element: Element;
  selector: string;
}): boolean => {
  if (isFunction(element.matches)) {
    return element.matches(selector);
  }

  if (isDefined(element.parentNode)) {
    const candidates = element.parentNode.querySelectorAll(selector);

    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    ) {
      if (candidates[candidateIndex] === element) {
        return true;
      }
    }

    return false;
  }

  const detachedContainer = element.ownerDocument.createDocumentFragment();
  const detachedElement = element.cloneNode(true);

  detachedContainer.appendChild(detachedElement);

  const candidates = detachedContainer.querySelectorAll(selector);

  for (
    let candidateIndex = 0;
    candidateIndex < candidates.length;
    candidateIndex++
  ) {
    if (candidates[candidateIndex] === detachedElement) {
      return true;
    }
  }

  return false;
};

export const installElementClosest = (elementPrototype: object): void => {
  if (isFunction((elementPrototype as { closest?: unknown }).closest)) {
    return;
  }

  Object.defineProperty(elementPrototype, 'closest', {
    value: function (this: Element, selector: string): Element | null {
      let currentElement: Element | null = this;

      while (isDefined(currentElement)) {
        if (matchesElementSelector({ element: currentElement, selector })) {
          return currentElement;
        }

        currentElement = currentElement.parentElement;
      }

      return null;
    },
    configurable: true,
    writable: true,
  });
};

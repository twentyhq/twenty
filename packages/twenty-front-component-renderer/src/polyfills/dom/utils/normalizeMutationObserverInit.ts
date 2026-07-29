import { isDefined } from 'twenty-shared/utils';

export const normalizeMutationObserverInit = (
  options: MutationObserverInit,
): MutationObserverInit => {
  const hasAttributeRefinement =
    isDefined(options.attributeOldValue) || isDefined(options.attributeFilter);
  const hasCharacterDataRefinement = isDefined(options.characterDataOldValue);

  const attributes = options.attributes ?? hasAttributeRefinement;
  const characterData = options.characterData ?? hasCharacterDataRefinement;

  if (hasAttributeRefinement && !attributes) {
    throw new TypeError(
      "MutationObserver.observe: 'attributeOldValue' and 'attributeFilter' require 'attributes' to be true",
    );
  }

  if (hasCharacterDataRefinement && !characterData) {
    throw new TypeError(
      "MutationObserver.observe: 'characterDataOldValue' requires 'characterData' to be true",
    );
  }

  if (!attributes && !characterData && options.childList !== true) {
    throw new TypeError(
      "MutationObserver.observe: at least one of 'childList', 'attributes' or 'characterData' must be true",
    );
  }

  return { ...options, attributes, characterData };
};

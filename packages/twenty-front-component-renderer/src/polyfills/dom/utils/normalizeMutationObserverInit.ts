import { isDefined } from 'twenty-shared/utils';

export const normalizeMutationObserverInit = (
  options: MutationObserverInit,
): MutationObserverInit => {
  const { attributeFilter } = options;

  const attributes =
    options.attributes ??
    (isDefined(options.attributeOldValue) || isDefined(attributeFilter));
  const characterData =
    options.characterData ?? isDefined(options.characterDataOldValue);

  if (options.childList !== true && !attributes && !characterData) {
    throw new TypeError(
      "MutationObserver.observe: at least one of 'childList', 'attributes' or 'characterData' must be true",
    );
  }

  if (options.attributeOldValue === true && !attributes) {
    throw new TypeError(
      "MutationObserver.observe: 'attributeOldValue' requires 'attributes' to be true",
    );
  }

  if (isDefined(attributeFilter) && !attributes) {
    throw new TypeError(
      "MutationObserver.observe: 'attributeFilter' requires 'attributes' to be true",
    );
  }

  if (options.characterDataOldValue === true && !characterData) {
    throw new TypeError(
      "MutationObserver.observe: 'characterDataOldValue' requires 'characterData' to be true",
    );
  }

  return {
    ...options,
    attributes,
    characterData,
    ...(isDefined(attributeFilter) && {
      attributeFilter: [...attributeFilter],
    }),
  };
};

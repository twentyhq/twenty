import { isNull, isObject, isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { normalizeScrollOffset } from '@/polyfills/scroll/utils/normalizeScrollOffset';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';

export const normalizeScrollToArguments = (
  scrollToArguments: unknown[],
): ScrollAxisOffsets => {
  if (scrollToArguments.length >= 2) {
    return {
      left: normalizeScrollOffset(scrollToArguments[0]),
      top: normalizeScrollOffset(scrollToArguments[1]),
    };
  }

  const [scrollToOptions] = scrollToArguments;

  if (isUndefined(scrollToOptions) || isNull(scrollToOptions)) {
    return {};
  }

  if (!isObject(scrollToOptions)) {
    throw new TypeError(
      "Failed to execute 'scrollTo' on 'Element': The provided value is not of type 'ScrollToOptions'.",
    );
  }

  const top: unknown = Reflect.get(scrollToOptions, 'top');
  const left: unknown = Reflect.get(scrollToOptions, 'left');

  return {
    ...(isDefined(top) && { top: normalizeScrollOffset(top) }),
    ...(isDefined(left) && { left: normalizeScrollOffset(left) }),
  };
};

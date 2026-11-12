import { isBoolean, isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';

// A workflow variable can resolve a header to a number, a boolean or nothing; axios sent the first two as strings and skipped empty ones.
export const normalizeHttpRequestHeaderValues = (
  rawInput: ToolInput,
): ToolInput => {
  if (!isPlainObject(rawInput.headers)) {
    return rawInput;
  }

  return {
    ...rawInput,
    headers: Object.fromEntries(
      Object.entries(rawInput.headers)
        .filter(([, value]) => isDefined(value))
        .map(([name, value]) => [
          name,
          isNumber(value) || isBoolean(value) ? String(value) : value,
        ]),
    ),
  };
};

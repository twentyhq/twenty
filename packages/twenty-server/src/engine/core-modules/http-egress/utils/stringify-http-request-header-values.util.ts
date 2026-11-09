import { isBoolean, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';

// A workflow variable can resolve a header to a number or boolean; axios always sent those as strings.
export const stringifyHttpRequestHeaderValues = (
  rawInput: ToolInput,
): ToolInput => {
  if (!isPlainObject(rawInput.headers)) {
    return rawInput;
  }

  return {
    ...rawInput,
    headers: Object.fromEntries(
      Object.entries(rawInput.headers).map(([name, value]) => [
        name,
        isNumber(value) || isBoolean(value) ? String(value) : value,
      ]),
    ),
  };
};

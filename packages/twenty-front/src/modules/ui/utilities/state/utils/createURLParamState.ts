import { createState } from 'twenty-ui/utilities';
import { uRLParamEffect } from '~/utils/recoil-effects';

export const createURLParamState = <T>({
  key,
  paramName,
  defaultValue,
  parseValue,
  stringifyValue,
}: {
  key: string;
  paramName: string;
  defaultValue: T;
  parseValue?: (value: string) => T | null;
  stringifyValue?: (value: T) => string | null;
}) => {
  return createState<T>({
    key,
    defaultValue,
    effects: [
      uRLParamEffect<T>(paramName, {
        parseValue,
        stringifyValue,
        defaultValue,
      }),
    ],
  });
};

import { createState } from 'twenty-ui/utilities';
import { uRLParamEffect } from '~/utils/recoil-effects';

// This is used to automatically save url parameters to a state
// which can then be accessed later after the user navigated.
// Example use-cases: referal tracking, pricing option already select on the marketing website, etc.
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

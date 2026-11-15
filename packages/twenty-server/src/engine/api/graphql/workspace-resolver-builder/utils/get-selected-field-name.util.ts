import { isObject, isString } from '@sniptt/guards';

// Own properties only: a client alias can be any name, including __proto__
export const getSelectedFieldName = ({
  responseKey,
  selection,
}: {
  responseKey: string;
  selection: unknown;
}): string => {
  const fieldName: unknown = isObject(selection)
    ? Object.getOwnPropertyDescriptor(selection, '__fieldName')?.value
    : undefined;

  return isString(fieldName) ? fieldName : responseKey;
};

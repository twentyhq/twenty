import { isNonEmptyString, isObject, isString } from '@sniptt/guards';

import { isDefined } from 'src/utils/is-defined';

const messageFromValue = (value: unknown): string | undefined => {
  if (isNonEmptyString(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const joined = value.filter(isString).join('; ');

    return isNonEmptyString(joined) ? joined : undefined;
  }

  return undefined;
};

export const extractPdlErrorMessage = ({
  json,
  httpStatus,
}: {
  json: Record<string, unknown>;
  httpStatus: number;
}): string => {
  const errorField = json.error;

  if (isObject(errorField)) {
    const fromErrorObject = messageFromValue(
      (errorField as Record<string, unknown>).message,
    );
    if (isDefined(fromErrorObject)) {
      return fromErrorObject;
    }
  }

  const fromTopLevel =
    messageFromValue(errorField) ?? messageFromValue(json.message);
  if (isDefined(fromTopLevel)) {
    return fromTopLevel;
  }

  return `PDL request failed (HTTP ${httpStatus}).`;
};

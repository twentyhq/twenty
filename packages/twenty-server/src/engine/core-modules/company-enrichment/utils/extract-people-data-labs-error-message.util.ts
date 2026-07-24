import { isNonEmptyString, isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const extractMessageFromValue = (messageValue: unknown): string | undefined => {
  if (isNonEmptyString(messageValue)) {
    return messageValue;
  }

  if (Array.isArray(messageValue)) {
    const joinedMessages = messageValue.filter(isString).join('; ');

    return isNonEmptyString(joinedMessages) ? joinedMessages : undefined;
  }

  return undefined;
};

export const extractPeopleDataLabsErrorMessage = ({
  json,
  httpStatus,
}: {
  json: Record<string, unknown>;
  httpStatus: number;
}): string => {
  const errorField = json.error;

  if (isObject(errorField)) {
    const messageFromErrorObject = extractMessageFromValue(
      (errorField as Record<string, unknown>).message,
    );

    if (isDefined(messageFromErrorObject)) {
      return messageFromErrorObject;
    }
  }

  const messageFromTopLevelField =
    extractMessageFromValue(errorField) ??
    extractMessageFromValue(json.message);

  if (isDefined(messageFromTopLevelField)) {
    return messageFromTopLevelField;
  }

  return `PDL request failed (HTTP ${httpStatus}).`;
};

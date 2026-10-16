import { isNonEmptyString, isObject } from '@sniptt/guards';

export const getCurrentApplicationId = (): string => {
  const encodedPayload = process.env.TWENTY_APP_ACCESS_TOKEN?.split('.')[1];

  if (!isNonEmptyString(encodedPayload)) {
    throw new Error('Application access token unavailable');
  }

  const payload: unknown = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString('utf8'),
  );

  if (
    !isObject(payload) ||
    !('applicationId' in payload) ||
    !isNonEmptyString(payload.applicationId)
  ) {
    throw new Error('Application ID unavailable');
  }

  return payload.applicationId;
};

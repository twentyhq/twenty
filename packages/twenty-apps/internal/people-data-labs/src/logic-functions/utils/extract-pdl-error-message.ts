import { isObject } from '@sniptt/guards';

export const extractPdlErrorMessage = (
  json: Record<string, unknown>,
  httpStatus: number,
): string => {
  const errorField = json.error;

  if (isObject(errorField) && 'message' in errorField) {
    return String((errorField as { message: unknown }).message);
  }

  return `PDL request failed (HTTP ${httpStatus}).`;
};

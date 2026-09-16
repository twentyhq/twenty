import { isAxiosError } from 'axios';

export const isTransientGoogleError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return (
    error.code === 'ECONNABORTED' ||
    status === 429 ||
    (status !== undefined && status >= 500)
  );
};

export const isGoogleAuthorizationFailure = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status === 401 || status === 403;
};

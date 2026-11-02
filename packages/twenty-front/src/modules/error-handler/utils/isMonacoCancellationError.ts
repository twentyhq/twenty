import { doNotTranslate } from 'twenty-shared/i18n';

const MONACO_CANCELED_ERROR_NAME = doNotTranslate('Canceled');

export const isMonacoCancellationError = (error: Error) =>
  error.name === MONACO_CANCELED_ERROR_NAME &&
  error.message === MONACO_CANCELED_ERROR_NAME;

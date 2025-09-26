import { CustomError } from '@/error-handler/CustomError';

export const throwCustomError = (message: string, code?: string) => {
  throw new CustomError(message, code);
};

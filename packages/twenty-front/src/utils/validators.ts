import { z } from 'zod';

export const VALIDATORS = {
  EMAIL: (valueToValidate: string) =>
    z.string().email().safeParse(valueToValidate).success,
};

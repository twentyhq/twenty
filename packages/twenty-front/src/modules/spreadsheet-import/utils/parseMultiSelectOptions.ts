import { z } from 'zod';

export const parseMultiSelectOptions = (value: unknown) => {
  try {
    return JSON.parse(z.string().parse(value));
  } catch {
    return z
      .string()
      .parse(value)
      .split(',')
      .map((item) => item.trim());
  }
};

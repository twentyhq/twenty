import camelCase from 'lodash.camelcase';
import { z } from 'zod';

export const camelCaseStringSchema = z
  .string()
  .refine((value) => camelCase(value) === value, {
    message: 'A string deve estar em camel case',
  });

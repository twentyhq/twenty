import camelCase from 'lodash.camelcase';
import { t } from '@lingui/core/macro';
import { z } from 'zod';

export const camelCaseStringSchema = z
  .string()
  .refine((value) => camelCase(value) === value, {
    error: () => t`String should be camel case`,
  });

import { t } from '@lingui/core/macro';
import { z } from 'zod';

export const zodNonEmptyString = z
  .string()
  .min(1, t`String must contain at least 1 character`);

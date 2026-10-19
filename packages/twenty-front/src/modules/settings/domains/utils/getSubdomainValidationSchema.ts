import { t } from '@lingui/core/macro';
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_PATTERN,
} from 'twenty-shared/constants';
import { z } from 'zod';

export const getSubdomainValidationSchema = () =>
  z
    .string()
    .min(1, { error: () => t`Subdomain cannot be empty` })
    .max(30, { error: () => t`Subdomain cannot be longer than 30 characters` })
    .regex(SUBDOMAIN_PATTERN, {
      error: () =>
        t`Use letter, number and dash only. Start and finish with a letter or a number`,
    })
    .refine((value) => !RESERVED_SUBDOMAINS.includes(value.toLowerCase()), {
      error: () => t`This subdomain is reserved`,
    });

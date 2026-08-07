import { t } from '@lingui/core/macro';
import {
  DEFAULT_SUBDOMAIN_MIN_LENGTH,
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_PATTERN,
} from 'twenty-shared/constants';
import { z } from 'zod';

export const getSubdomainValidationSchema = (
  minLength = DEFAULT_SUBDOMAIN_MIN_LENGTH,
) =>
  z
    .string()
    .min(minLength, {
      message: t`Subdomain cannot be shorter than ${minLength} characters`,
    })
    .max(30, { message: t`Subdomain can not be longer than 30 characters` })
    .regex(SUBDOMAIN_PATTERN, {
      message: t`Use letter, number and dash only. Start and finish with a letter or a number`,
    })
    .refine((value) => !RESERVED_SUBDOMAINS.includes(value.toLowerCase()), {
      message: t`This subdomain is reserved`,
    });

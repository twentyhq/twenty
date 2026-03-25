import { t } from '@lingui/core/macro';
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_PATTERN,
} from 'twenty-shared/constants';
import { z } from 'zod';

export const getSubdomainValidationSchema = () =>
  z
    .string()
    .min(3, { message: t`Subdomain can not be shorter than 3 characters` })
    .max(30, { message: t`Subdomain can not be longer than 30 characters` })
    .regex(SUBDOMAIN_PATTERN, {
      message: t`Use letter, number and dash only. Start and finish with a letter or a number`,
    })
    .refine((value) => !RESERVED_SUBDOMAINS.includes(value.toLowerCase()), {
      message: t`This subdomain is reserved`,
    });

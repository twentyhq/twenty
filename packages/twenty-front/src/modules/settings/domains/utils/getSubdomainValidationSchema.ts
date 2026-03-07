import { z } from 'zod';
import { type useLingui } from '@lingui/react/macro';

export const getSubdomainValidationSchema = (
  t: ReturnType<typeof useLingui>['t'],
) =>
  z
    .string()
    .min(3, { message: t`Subdomain can not be shorter than 3 characters` })
    .max(30, { message: t`Subdomain can not be longer than 30 characters` })
    .regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, {
      message: t`Use letter, number and dash only. Start and finish with a letter or a number`,
    });

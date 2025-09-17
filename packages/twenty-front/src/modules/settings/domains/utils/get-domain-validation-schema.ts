import { z } from 'zod';
import { type useLingui } from '@lingui/react/macro';

export const getDomainValidationSchema = (
  t: ReturnType<typeof useLingui>['t'],
) =>
  z
    .string()
    .regex(
      /^([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
      {
        message: t`Invalid domain. Please include at least one subdomain (e.g., sub.example.com).`,
      },
    )
    .regex(
      /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
      {
        message: t`Invalid domain. Domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
      },
    )
    .max(256)
    .optional()
    .or(z.literal(''));

import { z } from 'zod';
import { i18n } from '@lingui/core';

export const getDomainValidationSchema = () =>
  z.union([
    z
      .string()
      .regex(
        /^([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
        {
          message: i18n._(
            `Invalid domain. Please include at least one subdomain (e.g., sub.example.com).`,
          ),
        },
      )
      .regex(
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
        {
          message: i18n._(
            `Invalid domain. Domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
          ),
        },
      )
      .max(256),
    z.string(''),
  ]);

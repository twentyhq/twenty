import { z } from 'zod';
import { i18n } from '@lingui/core';

export const getSubdomainValidationSchema = () =>
  z
    .string()
    .min(3, {
      message: i18n._(`Subdomain can not be shorter than 3 characters`),
    })
    .max(30, {
      message: i18n._(`Subdomain can not be longer than 30 characters`),
    })
    .regex(/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/, {
      message: i18n._(
        `Use letter, number and dash only. Start and finish with a letter or a number`,
      ),
    });

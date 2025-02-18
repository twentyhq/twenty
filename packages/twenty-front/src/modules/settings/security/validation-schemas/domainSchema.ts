import { z } from 'zod';
import { t } from '@lingui/macro';

export const domainSchema = z
  .string()
  .regex(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
    {
      // eslint-disable-next-line lingui/t-call-in-function
      message: t`Invalid custom domain. Custom domains have to be smaller than 256 characters in length, cannot be IP addresses, cannot contain spaces, cannot contain any special characters such as _~\`!@#$%^*()=+{}[]|\\;:'",<>/? and cannot begin or end with a '-' character.`,
    },
  )
  .max(256);

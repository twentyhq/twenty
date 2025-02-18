import { z } from 'zod';

export const TrustedDomainParamsSchema = z
  .object({
    domain: z.string().nonempty(),
    email: z.string().url().nonempty(),
  })
  .required();

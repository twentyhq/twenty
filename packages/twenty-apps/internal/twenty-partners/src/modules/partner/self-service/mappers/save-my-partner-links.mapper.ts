import { z } from 'zod';

import { isHttpUrl } from 'src/modules/shared/utils/http-url.util';

export const saveLinksSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      url: z.string().refine((value) => value === '' || isHttpUrl(value), {
        message: 'URL must use http or https',
      }),
      sortOrder: z.number().optional(),
    }),
  ),
});

export type SaveLinksInput = z.infer<typeof saveLinksSchema>;

export type LinkRow = {
  id: string;
  name: string | null;
  url: string | null;
  sortOrder: number | null;
};

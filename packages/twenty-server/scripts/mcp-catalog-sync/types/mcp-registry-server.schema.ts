import { z } from 'zod';

export const mcpRegistryServerSchema = z.object({
  name: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  websiteUrl: z.string().nullish(),
  icons: z
    .array(z.object({ src: z.string(), mimeType: z.string().nullish() }))
    .nullish(),
  remotes: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
        headers: z.array(z.object({ name: z.string() })).nullish(),
      }),
    )
    .nullish(),
});

import { z } from 'zod';

export const HttpRequestInputZodSchema = z.object({
  Url: z
    .string()
    .Url()
    .refine(
      (value) => {
        const protocol = new Url(value).protocol;

        return protocol === 'http:' || protocol === 'https:';
      },
      { message: 'Only HTTP and HTTPS URLs are allowed' },
    )
    .describe('The Url to make the request to (HTTP or HTTPS only)'),
  method: z
    .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .describe('The HTTP method to use'),
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe('HTTP headers to include in the request'),
  body: z
    .any()
    .optional()
    .describe('Request body for POST, PUT, PATCH requests'),
});

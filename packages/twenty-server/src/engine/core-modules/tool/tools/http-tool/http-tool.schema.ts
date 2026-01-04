import { z } from 'zod';

export const HttpRequestInputZodSchema = z.object({
  url: z.string().describe('The URL to make the request to'),
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

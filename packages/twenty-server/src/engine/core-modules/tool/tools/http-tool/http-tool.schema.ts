import { z } from 'zod';

export const HttpRequestInputZodSchema = z.object({
  url: z.string().describe('The URL to make the request to'),
  method: z
    .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .describe('The HTTP method to use'),
  headers: z
    .record(z.string())
    .optional()
    .describe('HTTP headers to include in the request'),
  body: z
    .any()
    .optional()
    .describe('Request body for POST, PUT, PATCH requests'),
});

export const HttpToolParametersZodSchema = z.object({
  toolDescription: z
    .string()
    .describe(
      "A clear, human-readable status message describing the HTTP request being made. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update (e.g., 'Making a GET request to ...'). Explain what endpoint you are calling and with what parameters in natural language.",
    ),
  input: HttpRequestInputZodSchema,
});

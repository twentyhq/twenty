import { z } from 'zod';

export const AGENT_HANDOFF_SCHEMA = z.object({
  loadingMessage: z
    .string()
    .describe(
      'A brief, user-friendly message explaining what is happening while the handoff is being processed. This will be shown to the user during the handoff execution.',
    ),
  input: z.object({
    messages: z
      .array(
        z.union([
          z.object({
            role: z.literal('system'),
            content: z.string(),
          }),
          z.object({
            role: z.literal('user'),
            content: z.union([
              z.string(),
              z.array(
                z.union([
                  z.object({
                    type: z.literal('text'),
                    text: z.string(),
                  }),
                  z.object({
                    type: z.literal('image'),
                    image: z
                      .string()
                      .describe('Base64 encoded image data or URL'),
                    mediaType: z.string().optional(),
                  }),
                  z.object({
                    type: z.literal('file'),
                    data: z
                      .string()
                      .describe('Base64 encoded file data or URL'),
                    mediaType: z.string(),
                  }),
                ]),
              ),
            ]),
          }),
          z.object({
            role: z.literal('assistant'),
            content: z.union([
              z.string(),
              z.array(
                z.union([
                  z.object({
                    type: z.literal('text'),
                    text: z.string(),
                  }),
                  z.object({
                    type: z.literal('file'),
                    data: z
                      .string()
                      .describe('Base64 encoded file data or URL'),
                    mediaType: z.string(),
                    filename: z.string().optional(),
                  }),
                  z.object({
                    type: z.literal('reasoning'),
                    text: z.string(),
                  }),
                  z.object({
                    type: z.literal('tool-call'),
                    toolCallId: z.string(),
                    toolName: z.string(),
                    input: z.record(z.string(), z.any()),
                  }),
                ]),
              ),
            ]),
          }),
          z.object({
            role: z.literal('tool'),
            content: z.union([
              z.string(),
              z.array(
                z.object({
                  type: z.literal('tool-result'),
                  toolCallId: z.string(),
                  toolName: z.string(),
                  result: z.unknown(),
                  isError: z.boolean().optional(),
                }),
              ),
            ]),
            toolCallId: z.string(),
          }),
        ]),
      )
      .describe(
        'The conversation history to provide context to the specialist agent. Should include the latest user message/prompt and can include system, user, assistant, and tool messages with various content types.',
      ),
  }),
});

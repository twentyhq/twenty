import { type z } from 'zod';

import { type OutboundRequestContext } from 'src/engine/core-modules/secure-http-client/outbound-request-context.type';
import { type HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';

export type HttpEgressRequest = {
  input: z.infer<typeof HttpRequestInputZodSchema>;
  limits: {
    timeoutMs: number;
    maxPayloadSizeBytes: number;
  };
  context: OutboundRequestContext;
};

import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';

export type HttpEgressRequest = {
  input: HttpRequestInput;
  limits: {
    timeoutMs: number;
    maxPayloadSizeBytes: number;
  };
};

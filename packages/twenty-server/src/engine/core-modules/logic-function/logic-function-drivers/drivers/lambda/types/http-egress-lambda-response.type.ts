import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

export type HttpEgressLambdaResponse = HttpEgressResponse & {
  resultIsError?: boolean;
};

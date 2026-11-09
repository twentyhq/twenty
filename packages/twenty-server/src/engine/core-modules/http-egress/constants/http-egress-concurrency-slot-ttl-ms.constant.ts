import { HTTP_TOOL_TIMEOUT_MS } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-timeout-ms.constant';

export const HTTP_EGRESS_CONCURRENCY_SLOT_TTL_MS =
  HTTP_TOOL_TIMEOUT_MS + 15_000;

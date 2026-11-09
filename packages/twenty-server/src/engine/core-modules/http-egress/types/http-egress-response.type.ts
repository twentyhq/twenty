import { type HttpEgressDiagnostics } from 'src/engine/core-modules/http-egress/types/http-egress-diagnostics.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type HttpEgressResponse = {
  toolOutput: ToolOutput;
  diagnostics: HttpEgressDiagnostics;
};

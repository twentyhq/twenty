import { type ProposeToolCallToolInput } from 'twenty-shared/ai';

import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';

// what the caller provides when a call is made; without a resolver, only emails can be proposed,
// since they run with the approver's permissions and need none of the caller's tools
export type PausingToolCallContext = {
  resolveProposal?: (
    input: ProposeToolCallToolInput,
  ) => Promise<ProposedToolCallResolution>;
};

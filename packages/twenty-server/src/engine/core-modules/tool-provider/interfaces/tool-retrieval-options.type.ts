import { type ToolCategory } from 'twenty-shared/ai';

export type ToolRetrievalOptions = {
  categories?: ToolCategory[];
  excludeTools?: string[];
  wrapWithErrorContext?: boolean;
  includeLoadingMessage?: boolean;
  // Apply output compaction (strip nulls/empty values) to dispatch results
  // before returning. Chat enables this to reduce token usage in the
  // conversation context; MCP and workflow agents leave raw output intact.
  compactOutput?: boolean;
  // Spill oversized dispatch results to a file and return a compact
  // { spilled, outputRef, shape, hint } envelope instead of the raw payload.
  // Same axis as compactOutput: chat enables it (and has the navigation tools
  // to read the file); MCP, workflow agents, and the code_interpreter sandbox
  // bridge leave output raw.
  spillLargeOutput?: boolean;
};

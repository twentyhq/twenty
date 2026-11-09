import { type ToolCatalogOptions } from 'src/engine/core-modules/tool-provider/types/tool-catalog-options.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

export type ToolRetrievalOptions = ToolCatalogOptions & {
  isToolOffered?: (tool: ToolIndexEntry) => boolean;
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

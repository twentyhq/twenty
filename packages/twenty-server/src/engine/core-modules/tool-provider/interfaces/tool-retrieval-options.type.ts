import { type ToolCategory } from 'twenty-shared/ai';

export type ToolRetrievalOptions = {
  categories?: ToolCategory[];
  excludeTools?: string[];
  wrapWithErrorContext?: boolean;
  includeLoadingMessage?: boolean;
  // Apply output compaction (strip nulls/empty values) to dispatch results
  // before returning. Chat enables this to reduce token usage in the
  // conversation context; MCP and workflow agents leave raw output intact.
  serializeOutput?: boolean;
};

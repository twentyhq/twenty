import { type ToolCategory } from 'twenty-shared/ai';

export type ToolRetrievalOptions = {
  categories?: ToolCategory[];
  excludeTools?: string[];
  compactOutput?: boolean;
  spillLargeOutput?: boolean;
};

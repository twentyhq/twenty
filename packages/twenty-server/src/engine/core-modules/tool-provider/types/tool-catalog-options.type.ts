import { type ToolCategory } from 'twenty-shared/ai';

export type ToolCatalogOptions = {
  categories?: ToolCategory[];
  excludeTools?: Set<string>;
};

import { type ToolCategory } from 'twenty-shared/ai';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
};

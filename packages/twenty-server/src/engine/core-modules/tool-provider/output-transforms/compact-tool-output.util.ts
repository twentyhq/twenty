import { stripEmptyValues } from './strip-empty-values.util';

// Compacts a tool output by stripping empty values and flattening
// the result structure for efficient LLM token consumption.
// This is applied as a post-processing step on all tool results
// before they are returned to the AI model.
export const compactToolOutput = (output: unknown): unknown => {
  if (!output || typeof output !== 'object') {
    return output;
  }

  return stripEmptyValues(output);
};

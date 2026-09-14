import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const normalizeToolOutputToJsonValues = (
  output: ToolOutput,
): ToolOutput => {
  try {
    return JSON.parse(JSON.stringify(output));
  } catch {
    return output;
  }
};

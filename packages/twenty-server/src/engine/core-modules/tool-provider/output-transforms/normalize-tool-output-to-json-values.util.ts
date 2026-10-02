import { isString } from '@sniptt/guards';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// Postgres jsonb rejects \u0000, which a tool can return from a binary body such as a fetched xlsx
const stripNulCharacters = (_key: string, value: unknown) =>
  isString(value) ? value.replace(/\0/g, '') : value;

export const normalizeToolOutputToJsonValues = (
  output: ToolOutput,
): ToolOutput => {
  try {
    const serializedOutput = JSON.stringify(output);

    return serializedOutput.includes('\\u0000')
      ? JSON.parse(serializedOutput, stripNulCharacters)
      : JSON.parse(serializedOutput);
  } catch {
    return output;
  }
};

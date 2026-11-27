import { formatRecordReference } from 'twenty-shared/ai';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const addChatReferencesToToolOutput = (
  output: ToolOutput,
): ToolOutput => {
  if (!isNonEmptyArray(output.recordReferences)) {
    return output;
  }

  return {
    ...output,
    recordReferences: output.recordReferences.map((recordReference) => ({
      ...recordReference,
      chatReference: formatRecordReference(recordReference),
    })),
  };
};

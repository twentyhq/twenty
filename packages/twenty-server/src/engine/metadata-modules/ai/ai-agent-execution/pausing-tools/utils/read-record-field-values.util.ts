import { camelToSnakeCase, isPlainObject } from 'twenty-shared/utils';

import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';

type RecordFieldValuesRead =
  | { isFound: true; values: Record<string, unknown> }
  | { isFound: false; error: string };

// reads through the record tools so the values compare in the shape the proposal holds them
export const readRecordFieldValues = async ({
  executeTool,
  objectNameSingular,
  recordId,
  fieldNames,
}: {
  executeTool: PausingToolCompletionContext['executeTool'];
  objectNameSingular: string;
  recordId: string;
  fieldNames: string[];
}): Promise<RecordFieldValuesRead> => {
  const toolOutput = await executeTool({
    toolName: `find_one_${camelToSnakeCase(objectNameSingular)}`,
    args: { id: recordId, select: fieldNames.length > 0 ? fieldNames : ['id'] },
  });

  if (!toolOutput.success) {
    return {
      isFound: false,
      error: toolOutput.error ?? toolOutput.message,
    };
  }

  const records = isPlainObject(toolOutput.result)
    ? toolOutput.result.records
    : undefined;
  const record = Array.isArray(records) ? records[0] : undefined;

  if (!isPlainObject(record)) {
    return {
      isFound: false,
      error: `No ${objectNameSingular} record has the id ${recordId}.`,
    };
  }

  return {
    isFound: true,
    values: Object.fromEntries(
      fieldNames
        .filter((fieldName) => fieldName in record)
        .map((fieldName) => [fieldName, record[fieldName]]),
    ),
  };
};

import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  type ProposeToolCallToolInput,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  parseEmailDocument,
} from 'twenty-shared/utils';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { readRecordFieldValues } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-record-field-values.util';

export type ProposedToolCallResolution =
  | { proposal: ProposedToolCall }
  | { error: string };

// the email card edits a structured document, and reads an HTML string as one
export const findEmailArgumentsError = (
  toolArguments: Record<string, unknown>,
): string | null => {
  if (isString(toolArguments.body)) {
    return null;
  }

  const parsedBody = parseEmailDocument(toolArguments.body);

  return parsedBody.success
    ? null
    : `The email body must be a structured email document ({type: "doc", content: [...]}) or an HTML string: ${parsedBody.error}`;
};

const resolveRecordProposal = async ({
  baseProposal,
  toolIndexEntry,
  executeTool,
}: {
  baseProposal: Omit<ProposedToolCall, 'template'>;
  toolIndexEntry: ToolIndexEntry;
  executeTool: PausingToolCompletionContext['executeTool'];
}): Promise<ProposedToolCallResolution> => {
  const { executionRef } = toolIndexEntry;
  const template = toolIndexEntry.approval?.template;

  if (executionRef.kind !== 'database_crud') {
    return { proposal: { ...baseProposal, template: 'generic' } };
  }

  const { objectNameSingular } = executionRef;

  if (template === 'recordCreate') {
    return {
      proposal: { ...baseProposal, template, objectNameSingular },
    };
  }

  const recordId = baseProposal.arguments.id;

  if (!isNonEmptyString(recordId)) {
    return { error: 'arguments.id must be the id of the record.' };
  }

  const changedFieldNames = Object.keys(baseProposal.arguments).filter(
    (fieldName) => fieldName !== 'id',
  );

  if (template === 'recordUpdate' && changedFieldNames.length === 0) {
    return { error: 'Propose at least one field to change.' };
  }

  // a deletion has no fields to compare, so its record's last update stands for its content
  const currentRecord = await readRecordFieldValues({
    executeTool,
    objectNameSingular,
    recordId,
    fieldNames: template === 'recordUpdate' ? changedFieldNames : ['updatedAt'],
  });

  if (!currentRecord.isFound) {
    return { error: currentRecord.error };
  }

  return {
    proposal:
      template === 'recordUpdate'
        ? {
            ...baseProposal,
            template,
            objectNameSingular,
            recordId,
            currentValues: currentRecord.values,
          }
        : {
            ...baseProposal,
            template: 'recordDelete',
            objectNameSingular,
            recordId,
            currentValues: currentRecord.values,
          },
  };
};

// findTool only returns tools the proposer could call itself, so nothing outside its reach is proposed
export const resolveProposedToolCall = async ({
  input,
  findTool,
  executeTool,
}: {
  input: ProposeToolCallToolInput;
  findTool: (toolName: string) => Promise<ToolIndexEntry | undefined>;
  executeTool: PausingToolCompletionContext['executeTool'];
}): Promise<ProposedToolCallResolution> => {
  const { toolName, summary } = input;
  const toolIndexEntry = await findTool(toolName);

  if (!isDefined(toolIndexEntry)) {
    return {
      error: `Tool "${toolName}" is not available here. Propose a tool you could call yourself.`,
    };
  }

  const { template = 'generic', alternativeToolNames } =
    toolIndexEntry.approval ?? {};
  const baseProposal = {
    toolName,
    toolLabel: toolIndexEntry.label,
    summary,
    arguments: input.arguments,
    ...(isNonEmptyArray(alternativeToolNames) ? { alternativeToolNames } : {}),
  };

  switch (template) {
    case 'email': {
      const emailArgumentsError = findEmailArgumentsError(input.arguments);

      return isDefined(emailArgumentsError)
        ? { error: emailArgumentsError }
        : { proposal: { ...baseProposal, template } };
    }
    case 'recordCreate':
    case 'recordUpdate':
    case 'recordDelete':
      return resolveRecordProposal({
        baseProposal,
        toolIndexEntry,
        executeTool,
      });
    default:
      return {
        proposal: {
          ...baseProposal,
          template: 'generic',
          ...(toolIndexEntry.executionRef.kind === 'database_crud'
            ? {
                objectNameSingular:
                  toolIndexEntry.executionRef.objectNameSingular,
              }
            : {}),
        },
      };
  }
};

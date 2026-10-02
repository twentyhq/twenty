import { isNonEmptyString } from '@sniptt/guards';
import {
  PROPOSE_EMAIL_TOOL_NAME,
  type ProposeToolCallToolInput,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { readRecordFieldValues } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-record-field-values.util';

// propose_email has a card made for writing emails
const EMAIL_TOOL_NAMES = new Set(['send_email', 'draft_email']);

export type ProposedToolCallResolution =
  | { proposal: ProposedToolCall }
  | { error: string };

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
  const toolArguments = input.arguments;

  if (EMAIL_TOOL_NAMES.has(toolName)) {
    return {
      error: `Emails are proposed with ${PROPOSE_EMAIL_TOOL_NAME}, which lets the person edit them before they go out.`,
    };
  }

  const toolIndexEntry = await findTool(toolName);

  if (!isDefined(toolIndexEntry)) {
    return {
      error: `Tool "${toolName}" is not available here. Propose a tool you could call yourself.`,
    };
  }

  const baseProposal = {
    toolName,
    toolLabel: toolIndexEntry.label,
    summary,
    arguments: toolArguments,
  };
  const { executionRef } = toolIndexEntry;

  if (executionRef.kind !== 'database_crud') {
    return { proposal: { ...baseProposal, template: 'generic' } };
  }

  const { objectNameSingular, operation } = executionRef;

  if (operation === 'create_one') {
    return {
      proposal: {
        ...baseProposal,
        template: 'recordCreate',
        objectNameSingular,
      },
    };
  }

  if (operation !== 'update_one' && operation !== 'delete_one') {
    return {
      proposal: { ...baseProposal, template: 'generic', objectNameSingular },
    };
  }

  const recordId = toolArguments.id;

  if (!isNonEmptyString(recordId)) {
    return { error: 'arguments.id must be the id of the record.' };
  }

  const changedFieldNames = Object.keys(toolArguments).filter(
    (fieldName) => fieldName !== 'id',
  );

  if (operation === 'update_one' && changedFieldNames.length === 0) {
    return { error: 'Propose at least one field to change.' };
  }

  const currentRecord = await readRecordFieldValues({
    executeTool,
    objectNameSingular,
    recordId,
    fieldNames: changedFieldNames,
  });

  if (!currentRecord.isFound) {
    return { error: currentRecord.error };
  }

  return {
    proposal:
      operation === 'update_one'
        ? {
            ...baseProposal,
            template: 'recordUpdate',
            objectNameSingular,
            recordId,
            currentValues: currentRecord.values,
          }
        : {
            ...baseProposal,
            template: 'recordDelete',
            objectNameSingular,
            recordId,
          },
  };
};

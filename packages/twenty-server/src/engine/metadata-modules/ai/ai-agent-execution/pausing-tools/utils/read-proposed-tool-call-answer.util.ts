import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-answer.type';

const OUTCOME_BY_STATUS: ReadonlyMap<
  string,
  ProposedToolCallAnswer['outcome']
> = new Map([
  ['approved', 'executed'],
  ['rejected', 'rejected'],
  ['failed', 'failed'],
  ['conflict', 'conflict'],
]);

// undefined while the call waits on the member, or once it closed without an answer
export const readProposedToolCallAnswer = (
  toolOutput: unknown,
): ProposedToolCallAnswer | undefined => {
  const result =
    isPlainObject(toolOutput) && isPlainObject(toolOutput.result)
      ? toolOutput.result
      : {};
  const proposal = isPlainObject(result.proposal) ? result.proposal : {};
  const outcome = isString(result.status)
    ? OUTCOME_BY_STATUS.get(result.status)
    : undefined;

  if (!isDefined(outcome) || !isString(proposal.toolName)) {
    return undefined;
  }

  return {
    outcome,
    toolName: proposal.toolName,
    arguments: isPlainObject(proposal.arguments) ? proposal.arguments : {},
    output: result.output ?? null,
    feedback: isString(result.feedback) ? result.feedback : null,
    error: isString(result.error) ? result.error : null,
  };
};

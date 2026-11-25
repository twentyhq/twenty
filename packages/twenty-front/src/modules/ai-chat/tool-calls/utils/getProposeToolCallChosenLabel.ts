import {
  getApprovedToolCallLabel,
  type ProposeToolCallToolResult,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const getProposeToolCallChosenLabel = (
  result: ProposeToolCallToolResult | undefined,
): string | undefined => {
  if (!isDefined(result)) {
    return undefined;
  }

  if (result.status === 'approved') {
    return getApprovedToolCallLabel({
      labels: result.proposal.labels,
      toolName: result.proposal.toolName,
    });
  }

  if (result.status === 'rejected') {
    return result.proposal.labels?.reject;
  }

  return undefined;
};

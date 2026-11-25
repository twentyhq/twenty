import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const buildRejectedToolCallOutput = ({
  proposal,
  feedback,
}: {
  proposal: ProposedToolCall;
  feedback?: string;
}) => ({
  success: true,
  result: {
    status: 'rejected',
    proposal,
    ...(isDefined(feedback) ? { feedback } : {}),
  } satisfies ProposeToolCallToolResult,
});

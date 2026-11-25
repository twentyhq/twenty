import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
} from 'twenty-shared/ai';

export const buildRejectedToolCallOutput = ({
  proposal,
}: {
  proposal: ProposedToolCall;
}) => ({
  success: true,
  result: {
    status: 'rejected',
    proposal,
  } satisfies ProposeToolCallToolResult,
});

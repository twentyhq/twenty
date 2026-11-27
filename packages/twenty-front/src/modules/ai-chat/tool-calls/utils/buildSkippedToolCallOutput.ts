import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
} from 'twenty-shared/ai';

export const buildSkippedToolCallOutput = ({
  proposal,
}: {
  proposal: ProposedToolCall;
}) => ({
  success: true,
  result: {
    status: 'skipped',
    proposal,
  } satisfies ProposeToolCallToolResult,
});

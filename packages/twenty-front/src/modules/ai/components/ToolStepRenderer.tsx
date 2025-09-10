import styled from '@emotion/styled';

import { LoadingExpandableDisplay } from '@/ai/components/LoadingExpandableDisplay';
import type {
  ToolCallEvent,
  ToolEvent,
  ToolResultEvent,
} from '@/ai/types/streamTypes';

const StyledContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type ToolStepRendererProps = {
  events: ToolEvent[];
};

export const ToolStepRenderer = ({ events }: ToolStepRendererProps) => {
  const toolCall = events[0] as ToolCallEvent | undefined;
  const toolResult = events.find(
    (event): event is ToolResultEvent => event.type === 'tool-result',
  );

  if (!toolCall) {
    return null;
  }

  return (
    <StyledContainer>
      <LoadingExpandableDisplay
        isLoading={!toolResult}
        loadingText={toolCall.args.loadingMessage}
        buttonText={toolCall.args.completionMessage}
        children={
          toolResult?.result ? JSON.stringify(toolResult.result) : undefined
        }
      />
    </StyledContainer>
  );
};

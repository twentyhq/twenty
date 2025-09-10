import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { LoadingExpandableDisplay } from '@/ai/components/LoadingExpandableDisplay';
import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';
import { parseStream } from '@/ai/utils/parseStream';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledLoadingExpandableDisplayContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const AIChatMessageStreamRenderer = ({
  streamData,
}: {
  streamData: string;
}) => {
  const steps = parseStream(streamData);

  return (
    <div>
      {steps.map((step, index) => {
        const isToolStep = step.type === 'tool';
        const isTextStep = step.type === 'text';
        const isReasoningStep = step.type === 'reasoning';

        if (isToolStep) {
          const toolCall = step.events?.[0] as unknown as {
            args: { loadingMessage: string; completionMessage: string };
          };
          const toolResult =
            step.events?.[1]?.type === 'tool-result' ? step.events?.[1] : null;

          return (
            <StyledLoadingExpandableDisplayContainer key={index}>
              <LoadingExpandableDisplay
                isLoading={!toolResult}
                loadingText={toolCall.args.loadingMessage}
                buttonText={toolCall.args.completionMessage}
                children={
                  toolResult?.result
                    ? JSON.stringify(toolResult.result)
                    : undefined
                }
              />
            </StyledLoadingExpandableDisplayContainer>
          );
        }

        if (isReasoningStep) {
          return (
            <ReasoningSummaryDisplay
              key={index}
              reasoningSummary={step.content}
              isReasoningStreaming={step.isThinking}
              isCompleted={!step.isThinking}
            />
          );
        }

        if (isTextStep && isDefined(step.content)) {
          return <LazyMarkdownRenderer text={step.content} key={index} />;
        }
      })}
    </div>
  );
};

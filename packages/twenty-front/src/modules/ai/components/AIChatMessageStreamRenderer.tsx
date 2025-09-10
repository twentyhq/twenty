import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { LoadingExpandableDisplay } from '@/ai/components/LoadingExpandableDisplay';
import { groupSteps } from '@/ai/utils/groupSteps';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledLoadingExpandableDisplayContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const AIChatMessageStreamRenderer = ({
  streamData,
}: {
  streamData?: string | undefined;
}) => {
  const events =
    streamData
      ?.split('\n')
      .filter((item) => item.trim() !== '')
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return {};
        }
      }) || [];

  const steps = groupSteps(events);

  return (
    <div>
      {steps.map((step, index) => {
        const isToolStep = step.type === 'tool-call';
        const isTextStep = step.type === 'text';
        const isReasoningStep = step.type === 'reasoning';

        if (isToolStep) {
          const toolCall = step.events?.[0] as unknown as {
            args: { loadingMessage: string; completionMessage: string };
          };
          const toolResult = step.events?.[1] ? step.events?.[1] : null;

          return (
            <StyledLoadingExpandableDisplayContainer key={index}>
              <LoadingExpandableDisplay
                isLoading={!toolResult}
                loadingText={toolCall.args.loadingMessage}
                buttonText={toolCall.args.completionMessage}
                children={
                  toolResult?.result
                    ? JSON.stringify(toolResult?.result)
                    : undefined
                }
              />
            </StyledLoadingExpandableDisplayContainer>
          );
        }

        if (isReasoningStep) {
          return (
            <StyledLoadingExpandableDisplayContainer key={index}>
              <LoadingExpandableDisplay
                isLoading={Boolean(
                  step.events?.[step.events?.length - 1].type === 'reasoning',
                )}
                loadingText={'Thinking'}
                children={step.content}
                buttonText="Finished thinking"
              />
            </StyledLoadingExpandableDisplayContainer>
          );
        }

        if (isTextStep && isDefined(step.content)) {
          return <LazyMarkdownRenderer text={step.content} key={index} />;
        }
      })}
    </div>
  );
};

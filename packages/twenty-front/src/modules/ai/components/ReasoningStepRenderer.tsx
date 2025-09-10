import { ReasoningSummaryDisplay } from '@/ai/components/ReasoningSummaryDisplay';

type ReasoningStepRendererProps = {
  content: string;
  isThinking: boolean;
};

export const ReasoningStepRenderer = ({
  content,
  isThinking,
}: ReasoningStepRendererProps) => {
  return (
    <ReasoningSummaryDisplay
      reasoningSummary={content}
      isReasoningStreaming={isThinking}
      isCompleted={!isThinking}
    />
  );
};

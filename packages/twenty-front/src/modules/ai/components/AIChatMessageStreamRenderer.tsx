import { ReasoningStepRenderer } from '@/ai/components/ReasoningStepRenderer';
import { TextStepRenderer } from '@/ai/components/TextStepRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import type {
  AIChatMessageStreamRendererProps,
  ParsedStep,
} from '@/ai/types/streamTypes';
import { parseStream } from '@/ai/utils/parseStream';

export const AIChatMessageStreamRenderer = ({
  streamData,
}: AIChatMessageStreamRendererProps) => {
  const steps = parseStream(streamData);

  const renderStep = (step: ParsedStep, index: number) => {
    switch (step.type) {
      case 'tool':
        return <ToolStepRenderer key={index} events={step.events} />;
      case 'reasoning':
        return (
          <ReasoningStepRenderer
            key={index}
            content={step.content}
            isThinking={step.isThinking}
          />
        );
      case 'text':
        return <TextStepRenderer key={index} content={step.content} />;
      default:
        return null;
    }
  };

  return <div>{steps.map(renderStep)}</div>;
};

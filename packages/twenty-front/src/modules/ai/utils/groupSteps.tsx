import { isDefined } from 'twenty-shared/utils';

type StreamEvent = {
  type: string;
  [key: string]: unknown;
};

type GroupedStep = {
  type: string;
  events?: StreamEvent[];
  content?: string;
};

export const groupSteps = (stream: StreamEvent[]): GroupedStep[] => {
  const steps: GroupedStep[] = [];
  let currentStep: StreamEvent[] | null = null;
  let reasoningStep: StreamEvent[] | null = null;
  let textDeltaStep: StreamEvent[] | null = null;

  const createStep = (
    events: StreamEvent[],
    fallbackType: string,
  ): GroupedStep => ({
    type: events[0]?.type || fallbackType,
    events,
  });

  const createContentStep = (
    events: StreamEvent[],
    type: 'reasoning' | 'text',
  ): GroupedStep => {
    const content = events.map((event) => event.textDelta || '').join('');

    return {
      type,
      content,
    };
  };

  const closeCurrentStep = () => {
    if (isDefined(currentStep) && currentStep.length > 0) {
      steps.push(createStep(currentStep, 'unknown'));
      currentStep = null;
    }
  };

  const closeReasoningStep = () => {
    if (isDefined(reasoningStep) && reasoningStep.length > 0) {
      steps.push(createContentStep(reasoningStep, 'reasoning'));
      reasoningStep = null;
    }
  };

  const closeTextDeltaStep = () => {
    if (isDefined(textDeltaStep) && textDeltaStep.length > 0) {
      steps.push(createContentStep(textDeltaStep, 'text'));
      textDeltaStep = null;
    }
  };

  for (const event of stream) {
    switch (event.type) {
      case 'step-start':
        closeCurrentStep();
        closeTextDeltaStep();
        currentStep = [];
        break;

      case 'step-finish':
        closeCurrentStep();
        closeTextDeltaStep();
        break;

      case 'reasoning':
        if (!reasoningStep) {
          reasoningStep = [];
        }
        reasoningStep.push(event);
        break;

      case 'reasoning-signature':
        if (reasoningStep !== null) {
          reasoningStep.push(event);
          closeReasoningStep();
        }
        break;

      case 'text-delta':
        if (!textDeltaStep) {
          textDeltaStep = [];
        }
        textDeltaStep.push(event);
        break;

      default:
        if (currentStep !== null) {
          currentStep.push(event);
        }
        break;
    }
  }
  closeCurrentStep();
  closeReasoningStep();
  closeTextDeltaStep();

  return steps;
};

import { type Dispatch, type SetStateAction, useEffect } from 'react';

const MESSAGE_INTERVAL_IN_MS = 1000;

type OnboardingActivationStepsEffectProps = {
  messageIndex: number;
  setMessageIndex: Dispatch<SetStateAction<number>>;
  messageCount: number;
};

export const OnboardingActivationStepsEffect = ({
  messageIndex,
  setMessageIndex,
  messageCount,
}: OnboardingActivationStepsEffectProps) => {
  useEffect(() => {
    const isLastMessage = messageIndex >= messageCount - 1;

    if (isLastMessage) {
      return;
    }

    const timeout = setTimeout(() => {
      setMessageIndex((previousIndex) => previousIndex + 1);
    }, MESSAGE_INTERVAL_IN_MS);

    return () => clearTimeout(timeout);
  }, [messageIndex, setMessageIndex, messageCount]);

  return <></>;
};

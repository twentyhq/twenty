import { type Meta, type StoryObj } from '@storybook/react-vite';

import { OnboardingActivationSteps } from '@/onboarding/components/OnboardingActivationSteps';
import { OnboardingActivationStepsEffect } from '@/onboarding/components/OnboardingActivationStepsEffect';
import { ONBOARDING_ACTIVATION_MESSAGES } from '@/onboarding/constants/OnboardingActivationMessages';
import { useState } from 'react';
import { ModalContent } from 'twenty-ui/surfaces';
import { ComponentDecorator } from 'twenty-ui/testing';

const RenderWithModalContent = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <OnboardingActivationStepsEffect
        messageIndex={messageIndex}
        setMessageIndex={setMessageIndex}
        messageCount={ONBOARDING_ACTIVATION_MESSAGES.length}
      />
      <OnboardingActivationSteps
        messages={ONBOARDING_ACTIVATION_MESSAGES}
        messageIndex={messageIndex}
      />
    </ModalContent>
  );
};

const meta: Meta<typeof OnboardingActivationSteps> = {
  title: 'Modules/Onboarding/OnboardingActivationSteps',
  component: OnboardingActivationSteps,
  decorators: [ComponentDecorator],
  render: RenderWithModalContent,
};

export default meta;
type Story = StoryObj<typeof OnboardingActivationSteps>;

export const Default: Story = {};

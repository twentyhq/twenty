import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SignInUpWorkspaceActivation } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivation';
import { SignInUpWorkspaceActivationEffect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationEffect';
import { useState } from 'react';
import { ModalContent } from 'twenty-ui/surfaces';
import { ComponentDecorator } from 'twenty-ui/testing';

const RenderWithModalContent = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <SignInUpWorkspaceActivationEffect
        messageIndex={messageIndex}
        setMessageIndex={setMessageIndex}
      />
      <SignInUpWorkspaceActivation messageIndex={messageIndex} />
    </ModalContent>
  );
};

const meta: Meta<typeof SignInUpWorkspaceActivation> = {
  title: 'Modules/Auth/SignInUpWorkspaceActivation',
  component: SignInUpWorkspaceActivation,
  decorators: [ComponentDecorator],
  parameters: {
    codeSection: {
      docs: 'This component should always be wrapped with ModalContent in the app.\n\nCorrect usage:\n```tsx\n<ModalContent isVerticallyCentered isHorizontallyCentered>\n  <SignInUpWorkspaceActivation />\n</ModalContent>\n```\n',
    },
  },
  render: RenderWithModalContent,
};

export default meta;
type Story = StoryObj<typeof SignInUpWorkspaceActivation>;

export const Default: Story = {};

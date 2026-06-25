import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SignInUpWorkspaceActivationV2 } from '@/auth/sign-in-up/components/SignInUpWorkspaceActivationV2';
import { SignInUpWorkspaceActivationV2Effect } from '@/auth/sign-in-up/components/internal/SignInUpWorkspaceActivationV2Effect';
import { ModalContent } from 'twenty-ui/surfaces';
import { ComponentDecorator } from 'twenty-ui/testing';

const RenderWithModalContent = () => {
  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <SignInUpWorkspaceActivationV2Effect />
      <SignInUpWorkspaceActivationV2 />
    </ModalContent>
  );
};

const meta: Meta<typeof SignInUpWorkspaceActivationV2> = {
  title: 'Modules/Auth/SignInUpWorkspaceActivationV2',
  component: SignInUpWorkspaceActivationV2,
  decorators: [ComponentDecorator],
  parameters: {
    codeSection: {
      docs: 'This component should always be wrapped with ModalContent in the app.\n\nCorrect usage:\n```tsx\n<ModalContent isVerticallyCentered isHorizontallyCentered>\n  <SignInUpWorkspaceActivationV2 />\n</ModalContent>\n```\n',
    },
  },
  render: RenderWithModalContent,
};

export default meta;
type Story = StoryObj<typeof SignInUpWorkspaceActivationV2>;

export const Default: Story = {};

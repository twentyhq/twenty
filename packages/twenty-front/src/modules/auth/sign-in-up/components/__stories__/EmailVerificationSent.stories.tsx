import { type Meta, type StoryObj } from '@storybook/react';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { ComponentDecorator } from 'twenty-ui/testing';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';

// Wrap the component in Modal.Content to reflect how it's used in the app
const RenderWithModal = (
  args: React.ComponentProps<typeof EmailVerificationSent>,
) => {
  return (
    <Modal
      modalId="email-verification-sent-modal"
      padding="none"
      modalVariant="primary"
    >
      <Modal.Content isVerticalCentered isHorizontalCentered>
        <EmailVerificationSent email={args.email} isError={args.isError} />
      </Modal.Content>
    </Modal>
  );
};

const meta: Meta<typeof EmailVerificationSent> = {
  title: 'Modules/Auth/EmailVerificationSent',
  component: EmailVerificationSent,
  decorators: [ComponentDecorator, SnackBarDecorator],
  parameters: {
    codeSection: {
      docs: 'This component should always be wrapped with Modal.Content in the app.\n\nCorrect usage:\n```tsx\n<Modal.Content isVerticalCentered isHorizontalCentered>\n  <EmailVerificationSent email={email} />\n</Modal.Content>\n```\n',
    },
  },
  render: RenderWithModal,
};

export default meta;
type Story = StoryObj<typeof EmailVerificationSent>;

export const Default: Story = {
  args: {
    email: 'user@example.com',
    isError: false,
  },
};

export const Error: Story = {
  args: {
    email: 'user@example.com',
    isError: true,
  },
};

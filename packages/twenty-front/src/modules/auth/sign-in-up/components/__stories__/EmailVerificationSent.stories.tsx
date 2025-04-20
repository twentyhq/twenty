import { Meta, StoryObj } from '@storybook/react';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { ComponentDecorator } from 'twenty-ui/testing';
import { EmailVerificationSent } from '../EmailVerificationSent';

// Wrap the component in Modal.Content to reflect how it's used in the app
const RenderWithModal = (
  args: React.ComponentProps<typeof EmailVerificationSent>,
) => {
  return (
    <Modal padding="none" modalVariant="primary">
      <Modal.Content isVerticalCentered isHorizontalCentered>
        <EmailVerificationSent email={args.email} isError={args.isError} />
      </Modal.Content>
    </Modal>
  );
};

const meta: Meta<typeof EmailVerificationSent> = {
  title: 'Auth/EmailVerificationSent',
  component: EmailVerificationSent,
  decorators: [ComponentDecorator],
  parameters: {
    codeSection: {
      // Emphasize that this component needs to be wrapped in Modal.Content
      docs: 'IMPORTANT: This component should always be wrapped with Modal.Content in the app.\n\nCorrect usage:\n```tsx\n<Modal.Content isVerticalCentered isHorizontalCentered>\n  <EmailVerificationSent email={email} />\n</Modal.Content>\n```\n\nFailure to wrap with Modal.Content will result in visual inconsistencies as seen in the bug fixed in PR #XXXX.',
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

// This story shows how it looks if not properly wrapped (for comparison)
export const WithoutProperWrapper: StoryObj<typeof EmailVerificationSent> = {
  args: {
    email: 'user@example.com',
  },
  render: (args) => (
    <EmailVerificationSent email={args.email} isError={args.isError} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'This example shows how the component looks without proper Modal.Content wrapping, demonstrating the visual regression we want to avoid.',
      },
    },
  },
};

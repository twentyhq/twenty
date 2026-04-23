import { type Meta, type StoryObj } from '@storybook/react-vite';

import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { ModalContent } from 'twenty-ui/layout';
import { ComponentDecorator } from 'twenty-ui/testing';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const RenderWithModalContent = (
  args: React.ComponentProps<typeof EmailVerificationSent>,
) => {
  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <EmailVerificationSent email={args.email} isError={args.isError} />
    </ModalContent>
  );
};

const meta: Meta<typeof EmailVerificationSent> = {
  title: 'Modules/Auth/EmailVerificationSent',
  component: EmailVerificationSent,
  decorators: [ComponentDecorator, SnackBarDecorator],
  parameters: {
    codeSection: {
      docs: 'This component should always be wrapped with ModalContent in the app.\n\nCorrect usage:\n```tsx\n<ModalContent isVerticallyCentered isHorizontallyCentered>\n  <EmailVerificationSent email={email} />\n</ModalContent>\n```\n',
    },
  },
  render: RenderWithModalContent,
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

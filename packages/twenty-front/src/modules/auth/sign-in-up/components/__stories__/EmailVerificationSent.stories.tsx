import { StyledAuthContent } from '@/auth/components/StyledAuthContent';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const RenderWithStyledAuthContent = (
  args: React.ComponentProps<typeof EmailVerificationSent>,
) => {
  return (
    <StyledAuthContent>
      <EmailVerificationSent email={args.email} isError={args.isError} />
    </StyledAuthContent>
  );
};

const meta: Meta<typeof EmailVerificationSent> = {
  title: 'Modules/Auth/EmailVerificationSent',
  component: EmailVerificationSent,
  decorators: [ComponentDecorator, ToastDecorator],
  parameters: {
    codeSection: {
      docs: 'This component should always be wrapped with StyledAuthContent in the app.\n\nCorrect usage:\n```tsx\n<StyledAuthContent>\n  <EmailVerificationSent email={email} />\n</StyledAuthContent>\n```\n',
    },
  },
  render: RenderWithStyledAuthContent,
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

import { type VerifyEmail } from '@/auth/components/VerifyEmail';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock component that just renders the error state of VerifyEmail directly
// (since normal VerifyEmail has async logic that's hard to test in Storybook)
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';
import { ModalContent } from 'twenty-ui/surfaces';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const VerifyEmailErrorState = ({ email = 'user@example.com' }) => {
  return (
    <ModalContent isVerticallyCentered isHorizontallyCentered>
      <EmailVerificationSent email={email} isError={true} />
    </ModalContent>
  );
};

const meta: Meta<typeof VerifyEmailErrorState> = {
  title: 'Modules/Auth/VerifyEmail',
  component: VerifyEmailErrorState,
  decorators: [
    (Story) => (
      <div style={{ padding: '24px' }}>
        <Story />
      </div>
    ),
    SnackBarDecorator,
  ],
  parameters: {
    codeSection: {
      docs: 'IMPORTANT: When rendering EmailVerificationSent from VerifyEmail, always wrap it with ModalContent to maintain consistent styling.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VerifyEmail>;

export const ErrorState: Story = {
  args: {
    email: 'user@example.com',
  },
};

export const IntegratedExample: StoryObj<typeof VerifyEmail> = {
  render: () => (
    <MemoryRouter
      initialEntries={[
        '/verify-email?email=user@example.com&emailVerificationToken=invalid-token',
      ]}
    >
      <Routes>
        <Route
          path="/verify-email"
          element={<VerifyEmailErrorState email="user@example.com" />}
        />
      </Routes>
    </MemoryRouter>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'This demonstrates how the component should look when rendered in the app with proper Modal.Content wrapping.',
      },
    },
  },
  decorators: [SnackBarDecorator],
};

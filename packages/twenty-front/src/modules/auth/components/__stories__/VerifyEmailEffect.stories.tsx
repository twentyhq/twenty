import { type Meta, type StoryObj } from '@storybook/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { type VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';

// Mock component that just renders the error state of VerifyEmailEffect directly
// (since normal VerifyEmailEffect has async logic that's hard to test in Storybook)
import { Modal } from '@/ui/layout/modal/components/Modal';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { EmailVerificationSent } from '@/auth/sign-in-up/components/EmailVerificationSent';

const VerifyEmailEffectErrorState = ({ email = 'user@example.com' }) => {
  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <EmailVerificationSent email={email} isError={true} />
    </Modal.Content>
  );
};

const meta: Meta<typeof VerifyEmailEffectErrorState> = {
  title: 'Modules/Auth/VerifyEmailEffect',
  component: VerifyEmailEffectErrorState,
  decorators: [
    (Story) => (
      <div style={{ padding: '24px' }}>
        <RecoilRoot>
          <Story />
        </RecoilRoot>
      </div>
    ),
    SnackBarDecorator,
  ],
  parameters: {
    codeSection: {
      docs: 'IMPORTANT: When rendering EmailVerificationSent from VerifyEmailEffect, always wrap it with Modal.Content to maintain consistent styling.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VerifyEmailEffect>;

export const ErrorState: Story = {
  args: {
    email: 'user@example.com',
  },
};

export const IntegratedExample: StoryObj<typeof VerifyEmailEffect> = {
  render: () => (
    <RecoilRoot>
      <MemoryRouter
        initialEntries={[
          '/verify-email?email=user@example.com&emailVerificationToken=invalid-token',
        ]}
      >
        <Routes>
          <Route
            path="/verify-email"
            element={<VerifyEmailEffectErrorState email="user@example.com" />}
          />
        </Routes>
      </MemoryRouter>
    </RecoilRoot>
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

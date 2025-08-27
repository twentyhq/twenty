import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const TestWrapper = ({
  children,
  initialEntry = '/',
  isDeveloperDefaultSignInPrefilled = false,
}: {
  children: ReactNode;
  initialEntry?: string;
  isDeveloperDefaultSignInPrefilled?: boolean;
}) => (
  <MemoryRouter initialEntries={[initialEntry]}>
    <RecoilRoot
      initializeState={(snapshot) => {
        snapshot.set(
          isDeveloperDefaultSignInPrefilledState,
          isDeveloperDefaultSignInPrefilled,
        );
      }}
    >
      {children}
    </RecoilRoot>
  </MemoryRouter>
);

describe('useSignInUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the form with default values', async () => {
    const { result } = renderHook(() => useSignInUpForm(), {
      wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
    });
    expect(result.current.form).toBeDefined();
  });

  it('should not prefill sign-in developer defaults when state is false', () => {
    const { result } = renderHook(() => useSignInUpForm(), {
      wrapper: ({ children }) => (
        <TestWrapper initialEntry="?email=test@test.com">
          {children}
        </TestWrapper>
      ),
    });

    expect(result.current.form.getValues()).toEqual({
      exist: false,
      email: 'test@test.com',
      password: '',
      captchaToken: '',
    });
  });

  it('should prefill developer defaults when the state is true', () => {
    const { result } = renderHook(() => useSignInUpForm(), {
      wrapper: ({ children }) => (
        <TestWrapper
          initialEntry="?email=test@test.com"
          isDeveloperDefaultSignInPrefilled={true}
        >
          {children}
        </TestWrapper>
      ),
    });

    expect(result.current.form.getValues()).toEqual({
      exist: false,
      email: 'test@test.com',
      password: 'tim@apple.dev',
      captchaToken: '',
    });
  });
});

import { RecoilRoot, useSetRecoilState } from 'recoil';
import { renderHook } from '@testing-library/react';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';

describe('useSignInUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the form with default values', async () => {
    const { result } = renderHook(() => useSignInUpForm(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
          <RecoilRoot>{children}</RecoilRoot>
        </MemoryRouter>
      ),
    });
    expect(result.current.form).toBeDefined();
  });

  it('should not prefill sign-in developer defaults when state is false', () => {
    const { result } = renderHook(() => useSignInUpForm(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['?email=test@test.com']}>
          <RecoilRoot>{children}</RecoilRoot>
        </MemoryRouter>
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
    const { result } = renderHook(
      () => {
        const setIsDeveloperDefaultSignInPrefilledState = useSetRecoilState(
          isDeveloperDefaultSignInPrefilledState,
        );

        setIsDeveloperDefaultSignInPrefilledState(true);

        return useSignInUpForm();
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter initialEntries={['?email=test@test.com']}>
            <RecoilRoot>{children}</RecoilRoot>
          </MemoryRouter>
        ),
      },
    );

    expect(result.current.form.getValues()).toEqual({
      exist: false,
      email: 'test@test.com',
      password: 'Applecar2025',
      captchaToken: '',
    });
  });
});

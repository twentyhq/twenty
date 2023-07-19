import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilState } from 'recoil';
import * as Yup from 'yup';

import { Logo } from '@/auth/components/ui/Logo';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { MainButton } from '@/ui/button/components/MainButton';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { TextInput } from '@/ui/input/components/TextInput';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';
import { useCheckUserExistsQuery } from '~/generated/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

const StyledSectionContainer = styled.div`
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

const validationSchema = Yup.object()
  .shape({
    exist: Yup.boolean().required(),
    email: Yup.string().email('Email must be a valid email').required(),
    password: Yup.string()
      .matches(PASSWORD_REGEX, 'Password must contain at least 8 characters')
      .required(),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export function PasswordLogin() {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();

  const [isDemoMode] = useRecoilState(isDemoModeState);
  const [authFlowUserEmail] = useRecoilState(authFlowUserEmailState);
  const [showErrors, setShowErrors] = useState(false);

  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { data: checkUserExistsData } = useCheckUserExistsQuery({
    variables: {
      email: authFlowUserEmail,
    },
  });

  const { login, signUp } = useAuth();

  // Form
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    getValues,
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      exist: false,
      email: authFlowUserEmail,
      password: isDemoMode ? 'Applecar2025' : '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        if (!data.email || !data.password) {
          throw new Error('Email and password are required');
        }
        if (checkUserExistsData?.checkUserExists.exists) {
          await login(data.email, data.password);
        } else {
          await signUp(data.email, data.password, workspaceInviteHash);
        }
        navigate('/auth/create/workspace');
      } catch (err: any) {
        enqueueSnackBar(err?.message, {
          variant: 'error',
        });
      }
    },
    [
      checkUserExistsData?.checkUserExists.exists,
      navigate,
      login,
      signUp,
      workspaceInviteHash,
      enqueueSnackBar,
    ],
  );
  useScopedHotkeys(
    'enter',
    () => {
      onSubmit(getValues());
    },
    PageHotkeyScope.PasswordLogin,
    [onSubmit],
  );

  return (
    <>
      <Logo />
      <Title>Welcome to Twenty</Title>
      <SubTitle>
        Enter your credentials to sign{' '}
        {checkUserExistsData?.checkUserExists.exists ? 'in' : 'up'}
      </SubTitle>
      <StyledForm
        onSubmit={(event) => {
          setShowErrors(true);
          return handleSubmit(onSubmit)(event);
        }}
      >
        <StyledContentContainer>
          <StyledSectionContainer>
            <SubSectionTitle title="Email" />
            <Controller
              name="email"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
                  value={value}
                  placeholder="Email"
                  onBlur={onBlur}
                  onChange={onChange}
                  error={showErrors ? error?.message : undefined}
                  fullWidth
                />
              )}
            />
          </StyledSectionContainer>
          <StyledSectionContainer>
            <SubSectionTitle title="Password" />
            <Controller
              name="password"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
                  value={value}
                  type="password"
                  placeholder="Password"
                  onBlur={onBlur}
                  onChange={onChange}
                  error={showErrors ? error?.message : undefined}
                  fullWidth
                />
              )}
            />
          </StyledSectionContainer>
        </StyledContentContainer>
        <StyledButtonContainer>
          <MainButton
            title="Continue"
            type="submit"
            disabled={!watch('email') || !watch('password') || isSubmitting}
            fullWidth
          />
        </StyledButtonContainer>
      </StyledForm>
    </>
  );
}

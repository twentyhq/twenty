import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import * as Yup from 'yup';

import { Logo } from '@/auth/components/ui/Logo';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { authFlowUserEmailState } from '@/auth/states/authFlowUserEmailState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { CheckUserExistsDocument } from '~/generated/graphql';

const StyledContentContainer = styled.div`
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledAnimatedContent = styled(motion.div)`
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

const StyledErrorContainer = styled.div`
  color: ${({ theme }) => theme.color.red};
`;

const validationSchema = Yup.object()
  .shape({
    exist: Yup.boolean().required(),
    email: Yup.string().email().required(),
    password: Yup.string()
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        'Password must contain at least 8 characters, one uppercase and one number',
      )
      .required(),
  })
  .required();

type Form = Yup.InferType<typeof validationSchema>;

export function PasswordLogin() {
  const navigate = useNavigate();

  const [isDemoMode] = useRecoilState(isDemoModeState);
  const [authFlowUserEmail] = useRecoilState(authFlowUserEmailState);
  const [, setMockMode] = useRecoilState(isMockModeState);

  const client = useApolloClient();

  const { login, signUp, signUpToWorkspace } = useAuth();

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    setValue,
    setError,
    getValues,
    watch,
  } = useForm<Form>({
    // mode: 'onChange',
    defaultValues: {
      exist: false,
      email: authFlowUserEmail,
      password: isDemoMode ? 'Applecar2025' : '',
    },
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    setMockMode(false);

    try {
      setMockMode(false);
      if (data.exist) {
        await login(authFlowUserEmail, internalPassword);
      } else {
        if (workspaceInviteHash) {
          await signUpToWorkspace(
            authFlowUserEmail,
            internalPassword,
            workspaceInviteHash,
          );
        } else {
          await signUp(authFlowUserEmail, internalPassword);
        }
      }
      navigate('/auth/create/workspace');
    } catch (err: any) {
      setError('root', { message: err?.message });
    }
  };

    workspaceInviteHash,
  ]);

  useScopedHotkeys(
    'enter',
    () => {
      onSubmit(getValues());
    },
    InternalHotkeysScope.PasswordLogin,
    [onSubmit],
  );

  // useEffect(() => {
  //   const subscription = watch(async ({ email }) => {
  //     if (!email) return;

  //     try {
  //       // Check if it's a valid email to avoid useless requests
  //       validationSchema.pick(['email']).validateSync({ email });

  //       const { data } = await client.query({
  //         query: CheckUserExistsDocument,
  //         variables: {
  //           email,
  //         },
  //       });

  //       console.log('data', data);

  //       const newExist = !!data?.checkUserExists.exists;
  //       const { exist } = getValues();

  //       if (exist !== newExist) {
  //         setValue('exist', newExist);
  //       }
  //     } catch {}
  //   });

  //   return () => subscription.unsubscribe();
  // }, [getValues, setValue, watch, client]);

  console.log('RENDER !');

  return (
    <>
      <Logo />
      <Title>Welcome to Twenty</Title>

      <Controller
        name="exist"
        control={control}
        render={({ field: { value } }) => (
          <SubTitle>
            Enter your credentials to sign {value ? 'in' : 'up'}
          </SubTitle>
        )}
      />
      <StyledAnimatedContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledContentContainer>
            <StyledSectionContainer>
              <SubSectionTitle title="Email" />
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    placeholder="Email"
                    onBlur={onBlur}
                    onChange={onChange}
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
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    value={value}
                    placeholder="Password"
                    onBlur={onBlur}
                    onChange={onChange}
                    fullWidth
                    type="password"
                  />
                )}
              />
            </StyledSectionContainer>
          </StyledContentContainer>
          <StyledButtonContainer>
            <MainButton
              title="Continue"
              type="submit"
              disabled={!isValid || isSubmitting}
              fullWidth
            />
          </StyledButtonContainer>
          {errors && (
            <StyledErrorContainer>
              {errors?.email?.message ??
                errors?.root?.message ??
                errors?.password?.message}
            </StyledErrorContainer>
          )}
        </form>
      </StyledAnimatedContent>
    </>
  );
}

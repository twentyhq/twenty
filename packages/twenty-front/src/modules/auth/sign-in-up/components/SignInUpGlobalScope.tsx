import styled from '@emotion/styled';
import {
  AnimatedEaseIn,
  IconGoogle,
  IconMicrosoft,
  Loader,
  MainButton,
} from 'twenty-ui';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { useTheme } from '@emotion/react';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { TextInput } from '@/ui/input/components/TextInput';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { useFindAvailableWorkspacesByEmail } from '@/auth/sign-in-up/hooks/useFindAvailableWorkspacedByEmail';
import { FormEvent, useState } from 'react';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { availableWorkspacesForAuthState } from '@/auth/states/availableWorkspacesForAuthState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { redirectToWorkspace } from '~/utils/workspace-url.helper';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';

const StyledContentContainer = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const validationSchema = z
  .object({
    email: z.string().trim().email('Email must be a valid email'),
  })
  .required();

export const SignInUpGlobalScope = () => {
  const theme = useTheme();
  const isSignInPrefilled = useRecoilValue(isSignInPrefilledState);

  const { signInWithGoogle } = useSignInWithGoogle();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const { findAvailableWorkspacesByEmail } =
    useFindAvailableWorkspacesByEmail();
  const setAvailableWorkspacesForAuthState = useSetRecoilState(
    availableWorkspacesForAuthState,
  );

  const [showErrors, setShowErrors] = useState(false);

  const form = useForm<z.infer<typeof validationSchema>>({
    mode: 'onChange',
    defaultValues: {
      email: isSignInPrefilled === true ? 'tim@apple.dev' : '',
    },
    resolver: zodResolver(validationSchema),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    const { data } = await findAvailableWorkspacesByEmail(
      form.getValues('email'),
    );
    if (isDefined(data) && data.findAvailableWorkspacesByEmail.length > 1) {
      setAvailableWorkspacesForAuthState(data.findAvailableWorkspacesByEmail);
      return setSignInUpStep(SignInUpStep.WorkspaceSelection);
    }

    if (isDefined(data) && data.findAvailableWorkspacesByEmail.length === 1) {
      return redirectToWorkspace(
        data.findAvailableWorkspacesByEmail[0].subdomain,
        { email: form.getValues('email') },
      );
    }

    // si 1 workspace sans sso redirige sur workspace avec email en query params pour prefill
    // si 1 workspace avec sso et 1 sso login avec le sso
    // si plusieurs workspaces redirige sur la liste des workspaces
  };

  return (
    <>
      <StyledContentContainer>
        <>
          <MainButton
            Icon={() => <IconGoogle size={theme.icon.size.lg} />}
            title="Continue with Google"
            onClick={signInWithGoogle}
            fullWidth
          />
          <HorizontalSeparator visible={false} />
        </>
        <>
          <MainButton
            Icon={() => <IconMicrosoft size={theme.icon.size.lg} />}
            title="Continue with Microsoft"
            onClick={signInWithMicrosoft}
            fullWidth
          />
          <HorizontalSeparator visible={false} />
        </>
        <HorizontalSeparator visible />
        <StyledForm onSubmit={handleSubmit}>
          <StyledFullWidthMotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{
              type: 'spring',
              stiffness: 800,
              damping: 35,
            }}
          >
            <Controller
              name="email"
              control={form.control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <StyledInputContainer>
                  <TextInput
                    autoFocus
                    value={value}
                    placeholder="Email"
                    onChange={onChange}
                    error={showErrors ? error?.message : undefined}
                    fullWidth
                  />
                </StyledInputContainer>
              )}
            />
          </StyledFullWidthMotionDiv>
          <MainButton
            title="Continue"
            type="submit"
            variant="secondary"
            Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
            fullWidth
          />
        </StyledForm>
      </StyledContentContainer>
    </>
  );
};

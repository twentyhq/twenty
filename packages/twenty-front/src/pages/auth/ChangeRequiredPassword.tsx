import { Logo } from '@/auth/components/Logo';
import { StyledAuthCard } from '@/auth/components/StyledAuthCard';
import { StyledAuthContent } from '@/auth/components/StyledAuthContent';
import { StyledOnboardingContentContainer } from '@/auth/components/StyledOnboardingContentContainer';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { AnimatedEaseIn } from '@/auth/components/internal/AnimatedEaseIn/AnimatedEaseIn';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from 'twenty-ui/components/feedback';
import { MainButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { z } from 'zod';
import { ChangeRequiredPasswordDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const passwordLengthMessage = msg`Password must be between 8 and 50 characters`;
const passwordMismatchMessage = msg`Passwords do not match`;

const validationSchema = z
  .object({
    newPassword: z
      .string()
      .regex(PASSWORD_REGEX, i18n._(passwordLengthMessage)),
    confirmPassword: z.string(),
  })
  .refine((form) => form.newPassword === form.confirmPassword, {
    path: ['confirmPassword'],
    error: i18n._(passwordMismatchMessage),
  });

type Form = z.infer<typeof validationSchema>;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledMainButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const ChangeRequiredPassword = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [currentUser, setCurrentUser] = useAtomState(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const [changeRequiredPassword] = useMutation(ChangeRequiredPasswordDocument);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async ({ newPassword }: Form) => {
    try {
      await changeRequiredPassword({ variables: { newPassword } });

      setCurrentUser((user) =>
        user ? { ...user, mustChangePassword: false } : user,
      );
      enqueueToast({ status: 'success', children: t`Password has been set` });
    } catch (error) {
      logError(error);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledAuthContent>
      <StyledAuthCard>
        <AnimatedEaseIn>
          <Logo
            secondaryLogo={currentWorkspace?.logo}
            placeholder={currentWorkspace?.displayName}
          />
        </AnimatedEaseIn>
        <Title animate>{t`Choose a new password`}</Title>
        <SubTitle>
          {t`You signed in with a temporary password. Set your own to continue.`}
        </SubTitle>
        <StyledOnboardingContentContainer>
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              value={currentUser?.email ?? ''}
              placeholder={t`Email`}
              fullWidth
              disabled
            />
            <Controller
              name="newPassword"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
                  autoFocus
                  value={value}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t`New Password`}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <TextInput
                  value={value}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t`Confirm New Password`}
                  onBlur={onBlur}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <StyledMainButtonContainer>
              <MainButton
                type="submit"
                fullWidth
                disabled={isSubmitting}
                variant="outline"
              >
                {t`Set Password`}
              </MainButton>
            </StyledMainButtonContainer>
          </StyledForm>
        </StyledOnboardingContentContainer>
      </StyledAuthCard>
    </StyledAuthContent>
  );
};

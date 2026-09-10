import { type OTPFormValues } from '@/auth/sign-in-up/hooks/useTwoFactorAuthenticationForm';
import { VERIFY_TWO_FACTOR_AUTHENTICATION_METHOD_FOR_AUTHENTICATED_USER } from '@/settings/two-factor-authentication/graphql/mutations/verifyTwoFactorAuthenticationMethod';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useTwoFactorVerificationForSettings = () => {
  const { enqueueToast } = useToast();
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const { loadCurrentUser } = useLoadCurrentUser();

  const [verifyTwoFactorAuthenticationMethod] = useMutation(
    VERIFY_TWO_FACTOR_AUTHENTICATION_METHOD_FOR_AUTHENTICATED_USER,
  );

  const formConfig = useForm<OTPFormValues>({
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  const { isSubmitting } = formConfig.formState;
  const otpValue = formConfig.watch('otp');
  const canSave = !isSubmitting && otpValue?.length === 6;

  const handleVerificationSuccess = async () => {
    enqueueToast({
      variant: 'success',
      children: t`Two-factor authentication setup completed successfully!`,
    });

    await loadCurrentUser();

    navigate(SettingsPath.ProfilePage);
  };

  const handleSave = async (values: OTPFormValues) => {
    try {
      setIsLoading(true);

      await verifyTwoFactorAuthenticationMethod({
        variables: {
          otp: values.otp,
        },
      });

      await handleVerificationSuccess();
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Invalid verification code. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    formConfig.reset();
    navigate(SettingsPath.ProfilePage);
  };

  return {
    formConfig,
    isLoading,
    canSave,
    isSubmitting,
    handleSave,
    handleCancel,
  };
};

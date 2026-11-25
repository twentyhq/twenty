import { type OTPFormValues } from '@/auth/sign-in-up/hooks/useTwoFactorAuthenticationForm';
import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { VerifyTwoFactorAuthenticationMethodForAuthenticatedUserDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseTwoFactorVerificationForSettingsProps = {
  onBackupCodesIssued: (backupCodes: string[]) => void;
};

export const useTwoFactorVerificationForSettings = ({
  onBackupCodesIssued,
}: UseTwoFactorVerificationForSettingsProps) => {
  const { enqueueToast } = useToast();
  const navigate = useNavigateSettings();
  const { t } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const { loadCurrentUser } = useLoadCurrentUser();

  const [verifyTwoFactorAuthenticationMethod] = useMutation(
    VerifyTwoFactorAuthenticationMethodForAuthenticatedUserDocument,
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

  const handleVerificationSuccess = async (
    backupCodes: string[] | null | undefined,
  ) => {
    enqueueToast({
      status: 'success',
      children: t`Two-factor authentication setup completed successfully!`,
    });

    if (isNonEmptyArray(backupCodes)) {
      onBackupCodesIssued(backupCodes);
    }

    await loadCurrentUser();
  };

  const handleSave = async (values: OTPFormValues) => {
    try {
      setIsLoading(true);

      const result = await verifyTwoFactorAuthenticationMethod({
        variables: {
          otp: values.otp,
        },
      });

      await handleVerificationSuccess(
        result.data?.verifyTwoFactorAuthenticationMethodForAuthenticatedUser
          .backupCodes,
      );
    } catch (error) {
      enqueueToast(getTwoFactorAuthenticationErrorToastOptions({ error }));
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

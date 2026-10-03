import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { TwoFactorAuthenticationRecoveryCodeConfirmationDialog } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeConfirmationDialog';
import { TwoFactorAuthenticationRecoveryCodeDisplay } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeDisplay';
import { useGeneratedRecoveryCode } from '@/settings/two-factor-authentication/hooks/useGeneratedRecoveryCode';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { IconKey } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { GenerateTwoFactorAuthenticationRecoveryCodeAsServerAdminDocument } from '~/generated-admin/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsAdminTwoFactorAuthenticationRecoveryCodeProps = {
  userId: string;
  workspaceId: string;
  memberName: string;
};

export const SettingsAdminTwoFactorAuthenticationRecoveryCode = ({
  userId,
  workspaceId,
  memberName,
}: SettingsAdminTwoFactorAuthenticationRecoveryCodeProps) => {
  const dialogId = `admin-two-factor-authentication-recovery-code-${userId}-${workspaceId}`;
  const apolloAdminClient = useApolloAdminClient();
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  } = useGeneratedRecoveryCode();

  const [generateRecoveryCode] = useMutation(
    GenerateTwoFactorAuthenticationRecoveryCodeAsServerAdminDocument,
    { client: apolloAdminClient },
  );

  const handleGenerate = async (otp: string) => {
    try {
      const result = await generateRecoveryCode({
        variables: {
          userId,
          workspaceId,
          otp: isNonEmptyString(otp) ? otp : undefined,
        },
      });

      const recoveryCode =
        result.data?.generateTwoFactorAuthenticationRecoveryCodeAsServerAdmin;

      if (isDefined(recoveryCode)) {
        showGeneratedRecoveryCode(recoveryCode);
      }
    } catch (error) {
      enqueueToast(
        getTwoFactorAuthenticationErrorToastOptions({
          error,
          fallbackMessage: t`Failed to generate a recovery code.`,
        }),
      );
    }
  };

  return (
    <StyledContainer>
      {isDefined(generatedRecoveryCode) && (
        <TwoFactorAuthenticationRecoveryCodeDisplay
          recoveryCode={generatedRecoveryCode.recoveryCode}
          expiresAt={generatedRecoveryCode.expiresAt}
          memberName={memberName}
          onExpire={clearGeneratedRecoveryCode}
        />
      )}
      <div>
        <Button
          startIcon={<IconKey />}
          variant="outline"
          onClick={() => openDialog(dialogId)}
        >{t`Generate 2FA recovery code`}</Button>
      </div>
      <TwoFactorAuthenticationRecoveryCodeConfirmationDialog
        dialogId={dialogId}
        memberName={memberName}
        onConfirm={handleGenerate}
      />
    </StyledContainer>
  );
};

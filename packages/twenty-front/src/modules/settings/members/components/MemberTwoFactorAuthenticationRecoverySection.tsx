import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { TwoFactorAuthenticationRecoveryCodeConfirmationDialog } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeConfirmationDialog';
import { TwoFactorAuthenticationRecoveryCodeDisplay } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeDisplay';
import { useGeneratedRecoveryCode } from '@/settings/two-factor-authentication/hooks/useGeneratedRecoveryCode';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GenerateTwoFactorAuthenticationRecoveryCodeDocument,
  RevokeTwoFactorAuthenticationRecoveryCodeDocument,
  TwoFactorAuthenticationRecoveryStatusDocument,
} from '~/generated-metadata/graphql';
import { beautifyExactDateTime } from '~/utils/date-utils';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledActionRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type MemberTwoFactorAuthenticationRecoverySectionProps = {
  userId: string;
  memberName: string;
};

export const MemberTwoFactorAuthenticationRecoverySection = ({
  userId,
  memberName,
}: MemberTwoFactorAuthenticationRecoverySectionProps) => {
  const generateRecoveryCodeDialogId = `member-two-factor-authentication-recovery-code-dialog-${userId}`;
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const {
    generatedRecoveryCode,
    showGeneratedRecoveryCode,
    clearGeneratedRecoveryCode,
  } = useGeneratedRecoveryCode();

  const { data, refetch } = useQuery(
    TwoFactorAuthenticationRecoveryStatusDocument,
    { variables: { userId }, fetchPolicy: 'network-only' },
  );

  const [generateRecoveryCode] = useMutation(
    GenerateTwoFactorAuthenticationRecoveryCodeDocument,
  );
  const [revokeRecoveryCode] = useMutation(
    RevokeTwoFactorAuthenticationRecoveryCodeDocument,
  );

  const recoveryStatus = data?.twoFactorAuthenticationRecoveryStatus;

  if (!isDefined(recoveryStatus)) {
    return null;
  }

  const handleGenerate = async (otp: string) => {
    try {
      const result = await generateRecoveryCode({
        variables: { userId, otp: isNonEmptyString(otp) ? otp : undefined },
      });

      const recoveryCode =
        result.data?.generateTwoFactorAuthenticationRecoveryCode;

      if (isDefined(recoveryCode)) {
        showGeneratedRecoveryCode(recoveryCode);
      }

      await refetch();
    } catch (error) {
      enqueueToast(
        getTwoFactorAuthenticationErrorToastOptions({
          error,
          fallbackMessage: t`Failed to generate a recovery code.`,
        }),
      );
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeRecoveryCode({ variables: { userId } });
      clearGeneratedRecoveryCode();
      await refetch();
      enqueueToast({
        variant: 'success',
        children: t`Recovery code revoked.`,
      });
    } catch (error) {
      enqueueToast(
        getTwoFactorAuthenticationErrorToastOptions({
          error,
          fallbackMessage: t`Failed to revoke the recovery code.`,
        }),
      );
    }
  };

  const pendingRecoveryCodeExpiresAt =
    recoveryStatus.pendingRecoveryCodeExpiresAt;

  return (
    <Section.Root>
      <Section.Header
        title={t`Two-factor authentication`}
        description={t`Let this member sign in again if they lost their authenticator app`}
      />
      {recoveryStatus.hasVerifiedTwoFactorAuthenticationMethod ||
      recoveryStatus.isAwaitingRecoveryEnrollment ? (
        <StyledContent>
          {isDefined(generatedRecoveryCode) && (
            <TwoFactorAuthenticationRecoveryCodeDisplay
              recoveryCode={generatedRecoveryCode.recoveryCode}
              expiresAt={generatedRecoveryCode.expiresAt}
              memberName={memberName}
              onExpire={clearGeneratedRecoveryCode}
            />
          )}
          <StyledActionRow>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDialog(generateRecoveryCodeDialogId)}
            >{t`Generate recovery code`}</Button>
            {isDefined(pendingRecoveryCodeExpiresAt) && (
              <>
                <Status color="orange" weight="medium">
                  {t`Code pending until ${beautifyExactDateTime(pendingRecoveryCodeExpiresAt)}`}
                </Status>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRevoke}
                >{t`Revoke`}</Button>
              </>
            )}
          </StyledActionRow>
        </StyledContent>
      ) : (
        <StyledNotice>
          {t`This member hasn't set up two-factor authentication.`}
        </StyledNotice>
      )}
      <TwoFactorAuthenticationRecoveryCodeConfirmationDialog
        dialogId={generateRecoveryCodeDialogId}
        memberName={memberName}
        onConfirm={handleGenerate}
      />
    </Section.Root>
  );
};

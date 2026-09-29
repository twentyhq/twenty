import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { TwoFactorAuthenticationRecoveryCodeConfirmationDialog } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeConfirmationDialog';
import { TwoFactorAuthenticationRecoveryCodeDisplay } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeDisplay';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GenerateTwoFactorAuthenticationRecoveryCodeDocument,
  RevokeTwoFactorAuthenticationRecoveryCodeDocument,
  TwoFactorAuthenticationRecoveryStatusDocument,
} from '~/generated-metadata/graphql';
import { beautifyExactDateTime } from '~/utils/date-utils';

const GENERATE_RECOVERY_CODE_DIALOG_ID =
  'member-two-factor-authentication-recovery-code-dialog';

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

type GeneratedRecoveryCode = {
  recoveryCode: string;
  expiresAt: string;
};

type MemberTwoFactorAuthenticationRecoverySectionProps = {
  userId: string;
  memberName: string;
};

export const MemberTwoFactorAuthenticationRecoverySection = ({
  userId,
  memberName,
}: MemberTwoFactorAuthenticationRecoverySectionProps) => {
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();
  const [generatedRecoveryCode, setGeneratedRecoveryCode] =
    useState<GeneratedRecoveryCode | null>(null);

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
        variables: { userId, otp: otp.length > 0 ? otp : undefined },
      });

      const recoveryCode =
        result.data?.generateTwoFactorAuthenticationRecoveryCode;

      if (isDefined(recoveryCode)) {
        setGeneratedRecoveryCode(recoveryCode);
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
      setGeneratedRecoveryCode(null);
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
      {recoveryStatus.hasVerifiedTwoFactorAuthenticationMethod ? (
        <StyledContent>
          {isDefined(generatedRecoveryCode) && (
            <TwoFactorAuthenticationRecoveryCodeDisplay
              recoveryCode={generatedRecoveryCode.recoveryCode}
              expiresAt={generatedRecoveryCode.expiresAt}
              memberName={memberName}
            />
          )}
          <StyledActionRow>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDialog(GENERATE_RECOVERY_CODE_DIALOG_ID)}
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
        dialogId={GENERATE_RECOVERY_CODE_DIALOG_ID}
        memberName={memberName}
        onConfirm={handleGenerate}
      />
    </Section.Root>
  );
};

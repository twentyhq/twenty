import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { TwoFactorAuthenticationBackupCodesDisplay } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationBackupCodesDisplay';
import { TwoFactorAuthenticationOtpConfirmationDialog } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationOtpConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation, useQuery } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isNonEmptyArray, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  GenerateTwoFactorAuthenticationBackupCodesDocument,
  TwoFactorAuthenticationBackupCodeStatusDocument,
} from '~/generated-metadata/graphql';

const GENERATE_BACKUP_CODES_DIALOG_ID =
  'two-factor-authentication-backup-codes-dialog';

const LOW_BACKUP_CODE_COUNT = 2;

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

type TwoFactorAuthenticationBackupCodesSectionProps = {
  generatedBackupCodes: string[] | null;
  onBackupCodesGenerated: (backupCodes: string[]) => void;
};

export const TwoFactorAuthenticationBackupCodesSection = ({
  generatedBackupCodes,
  onBackupCodesGenerated,
}: TwoFactorAuthenticationBackupCodesSectionProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { enqueueToast } = useToast();

  const { data } = useQuery(TwoFactorAuthenticationBackupCodeStatusDocument, {
    fetchPolicy: 'network-only',
  });

  const [generateBackupCodes] = useMutation(
    GenerateTwoFactorAuthenticationBackupCodesDocument,
    { refetchQueries: [TwoFactorAuthenticationBackupCodeStatusDocument] },
  );

  const remainingBackupCodeCount =
    data?.twoFactorAuthenticationBackupCodeStatus.remainingBackupCodeCount;

  const handleGenerate = async (otp: string) => {
    try {
      const result = await generateBackupCodes({ variables: { otp } });

      const backupCodes =
        result.data?.generateTwoFactorAuthenticationBackupCodes.backupCodes;

      if (isNonEmptyArray(backupCodes)) {
        onBackupCodesGenerated(backupCodes);
      }
    } catch (error) {
      enqueueToast(
        getTwoFactorAuthenticationErrorToastOptions({
          error,
          fallbackMessage: t`Failed to generate backup codes.`,
        }),
      );
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Backup codes`}
        description={t`Use a backup code to sign in if you lose access to your authenticator app. Each code works once.`}
      />
      <StyledContent>
        {isNonEmptyArray(generatedBackupCodes) && (
          <TwoFactorAuthenticationBackupCodesDisplay
            backupCodes={generatedBackupCodes}
          />
        )}
        <StyledActionRow>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDialog(GENERATE_BACKUP_CODES_DIALOG_ID)}
          >
            {isDefined(remainingBackupCodeCount) && remainingBackupCodeCount > 0
              ? t`Generate new codes`
              : t`Generate backup codes`}
          </Button>
          {isDefined(remainingBackupCodeCount) && (
            <Status
              color={
                remainingBackupCodeCount > LOW_BACKUP_CODE_COUNT
                  ? 'gray'
                  : 'orange'
              }
              weight="medium"
            >
              {plural(remainingBackupCodeCount, {
                one: '# backup code left',
                other: '# backup codes left',
              })}
            </Status>
          )}
        </StyledActionRow>
      </StyledContent>
      <TwoFactorAuthenticationOtpConfirmationDialog
        dialogId={GENERATE_BACKUP_CODES_DIALOG_ID}
        title={t`Generate backup codes`}
        description={t`New backup codes replace your current ones, which stop working.`}
        confirmButtonText={t`Generate codes`}
        onConfirm={handleGenerate}
      />
    </Section.Root>
  );
};

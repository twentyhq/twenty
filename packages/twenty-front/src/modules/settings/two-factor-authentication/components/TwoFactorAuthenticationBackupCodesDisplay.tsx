import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { saveAs } from 'file-saver';
import { IconCopy, IconDownload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCodeGrid = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[6]};
  grid-template-columns: repeat(2, max-content);
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledActionRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type TwoFactorAuthenticationBackupCodesDisplayProps = {
  backupCodes: string[];
};

export const TwoFactorAuthenticationBackupCodesDisplay = ({
  backupCodes,
}: TwoFactorAuthenticationBackupCodesDisplayProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const backupCodesText = backupCodes.join('\n');

  const handleDownload = () => {
    saveAs(
      new Blob([backupCodesText], { type: 'text/plain;charset=utf-8' }),
      'twenty-backup-codes.txt',
    );
  };

  return (
    <StyledContainer>
      <StyledCodeGrid>
        {backupCodes.map((backupCode) => (
          <span key={backupCode}>{backupCode}</span>
        ))}
      </StyledCodeGrid>
      <StyledActionRow>
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconCopy />}
          onClick={() =>
            copyToClipboard(
              backupCodesText,
              t`Backup codes copied to clipboard`,
            )
          }
        >{t`Copy`}</Button>
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconDownload />}
          onClick={handleDownload}
        >{t`Download`}</Button>
      </StyledActionRow>
      <StyledHint>
        {t`Save these codes somewhere safe, like a password manager. Each code works once. You won't be able to see them again.`}
      </StyledHint>
    </StyledContainer>
  );
};

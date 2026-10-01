import { TwoFactorAuthenticationRecoveryCodeExpiryEffect } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationRecoveryCodeExpiryEffect';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { beautifyExactDateTime } from '~/utils/date-utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCodeRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCodeInputContainer = styled.div`
  flex: 1;
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type TwoFactorAuthenticationRecoveryCodeDisplayProps = {
  recoveryCode: string;
  expiresAt: string;
  memberName: string;
  onExpire: () => void;
};

export const TwoFactorAuthenticationRecoveryCodeDisplay = ({
  recoveryCode,
  expiresAt,
  memberName,
  onExpire,
}: TwoFactorAuthenticationRecoveryCodeDisplayProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const formattedExpiresAt = beautifyExactDateTime(expiresAt);

  return (
    <StyledContainer>
      <TwoFactorAuthenticationRecoveryCodeExpiryEffect
        expiresAt={expiresAt}
        onExpire={onExpire}
      />
      <StyledCodeRow>
        <StyledCodeInputContainer>
          <SettingsTextInput
            instanceId="two-factor-authentication-recovery-code-display"
            value={recoveryCode}
            readOnly
            fullWidth
          />
        </StyledCodeInputContainer>
        <Button
          startIcon={<IconCopy />}
          onClick={() =>
            copyToClipboard(recoveryCode, t`Recovery code copied to clipboard`)
          }
        >{t`Copy`}</Button>
      </StyledCodeRow>
      <StyledHint>
        {t`Share this code with ${memberName} through a channel you trust. It works once and expires at ${formattedExpiresAt}. You won't be able to see it again.`}
      </StyledHint>
    </StyledContainer>
  );
};

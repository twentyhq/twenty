import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export type LightCopyIconButtonProps = {
  copyText: string;
};

export const LightCopyIconButton = ({ copyText }: LightCopyIconButtonProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <LightIconButton
        Icon={IconCopy}
        onClick={() => {
          copyToClipboard(copyText, t`Text copied to clipboard`);
        }}
        aria-label={t`Copy to Clipboard`}
      />
    </StyledButtonContainer>
  );
};

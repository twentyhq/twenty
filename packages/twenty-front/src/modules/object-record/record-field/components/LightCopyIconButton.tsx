import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCopy, LightIconButton } from 'twenty-ui';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

const StyledButtonContainer = styled.div`
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export type LightCopyIconButtonProps = {
  copyText: string;
};

export const LightCopyIconButton = ({ copyText }: LightCopyIconButtonProps) => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <LightIconButton
        className="copy-button"
        Icon={IconCopy}
        onClick={() => {
          enqueueSnackBar(t`Text copied to clipboard`, {
            variant: SnackBarVariant.Success,
            icon: <IconCopy size={theme.icon.size.md} />,
            duration: 2000,
          });
          navigator.clipboard.writeText(copyText);
        }}
        aria-label="Copy to Clipboard"
      />
    </StyledButtonContainer>
  );
};

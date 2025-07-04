import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledButtonContainer = styled.div`
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export type LightCopyIconButtonProps = {
  copyText: string;
};

export const LightCopyIconButton = ({ copyText }: LightCopyIconButtonProps) => {
  const { enqueueSuccessSnackBar } = useSnackBar();
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <LightIconButton
        Icon={IconCopy}
        onClick={() => {
          enqueueSuccessSnackBar({
            message: t`Text copied to clipboard`,
            options: {
              icon: <IconCopy size={theme.icon.size.md} />,
              duration: 2000,
            },
          });
          navigator.clipboard.writeText(copyText);
        }}
        aria-label="Copy to Clipboard"
      />
    </StyledButtonContainer>
  );
};

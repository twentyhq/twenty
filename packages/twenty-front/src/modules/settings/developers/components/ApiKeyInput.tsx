import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';

import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type ApiKeyInputProps = { apiKey: string };

export const ApiKeyInput = ({ apiKey }: ApiKeyInputProps) => {
  const theme = useTheme();
  const { t } = useLingui();

  const { enqueueSuccessSnackBar } = useSnackBar();
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput instanceId="api-key-display" value={apiKey} fullWidth />
      </StyledLinkContainer>
      <Button
        Icon={IconCopy}
        title={t`Copy`}
        onClick={() => {
          enqueueSuccessSnackBar({
            message: t`API Key copied to clipboard`,
            options: {
              icon: <IconCopy size={theme.icon.size.md} />,
              duration: 2000,
            },
          });
          navigator.clipboard.writeText(apiKey);
        }}
      />
    </StyledContainer>
  );
};

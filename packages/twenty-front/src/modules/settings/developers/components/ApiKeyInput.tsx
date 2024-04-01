import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCopy } from 'twenty-ui';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';

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

  const { enqueueSnackBar } = useSnackBar();
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput value={apiKey} fullWidth />
      </StyledLinkContainer>
      <Button
        Icon={IconCopy}
        title="Copy"
        onClick={() => {
          enqueueSnackBar('Api Key copied to clipboard', {
            variant: 'success',
            icon: <IconCopy size={theme.icon.size.md} />,
            duration: 2000,
          });
          navigator.clipboard.writeText(apiKey);
        }}
      />
    </StyledContainer>
  );
};

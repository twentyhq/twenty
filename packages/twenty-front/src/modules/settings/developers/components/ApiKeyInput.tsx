import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Button, IconCopy, TextInput, useSnackBar } from 'twenty-ui';

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

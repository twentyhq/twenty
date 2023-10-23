import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';

import { IconCopy } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
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

type ApiKeyInputProps = { expiresAt?: string | null; apiKey: string };

export const ApiKeyInput = ({ expiresAt, apiKey }: ApiKeyInputProps) => {
  const theme = useTheme();
  const computeInfo = () => {
    if (!expiresAt) return '';
    const dateDiff = DateTime.fromISO(expiresAt).diff(DateTime.now(), [
      'years',
      'days',
    ]);
    let result = `This key will expire in `;
    if (dateDiff.years) result = result + `${dateDiff.years} year`;
    if (dateDiff.years > 1) result = result + 's';
    if (dateDiff.years && dateDiff.days) result = result + ' and ';
    if (dateDiff.days) result = result + `${Math.floor(dateDiff.days)} day`;
    if (dateDiff.days > 1) result = result + 's';
    return result;
  };

  const { enqueueSnackBar } = useSnackBar();
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput info={computeInfo()} value={apiKey} fullWidth />
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

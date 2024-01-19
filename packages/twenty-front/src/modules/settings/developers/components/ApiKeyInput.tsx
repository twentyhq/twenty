import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCopy } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import useI18n from '@/ui/i18n/useI18n';
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
  const { translate } = useI18n('translations');
  const theme = useTheme();

  const { enqueueSnackBar } = useSnackBar();
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <TextInput value={apiKey} fullWidth />
      </StyledLinkContainer>
      <Button
        Icon={IconCopy}
        title={translate('copy')}
        onClick={() => {
          enqueueSnackBar(translate('apiKeyCopiedToClipboard'), {
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

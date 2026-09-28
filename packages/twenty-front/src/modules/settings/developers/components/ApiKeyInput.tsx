import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-inline-end: ${themeCssVariables.spacing[2]};
`;

type ApiKeyInputProps = { apiKey: string };

export const ApiKeyInput = ({ apiKey }: ApiKeyInputProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  return (
    <StyledContainer>
      <StyledLinkContainer>
        <SettingsTextInput
          instanceId="api-key-display"
          value={apiKey}
          fullWidth
        />
      </StyledLinkContainer>
      <Button
        startIcon={<IconCopy />}
        onClick={() => {
          copyToClipboard(apiKey, t`API Key copied to clipboard`);
        }}
      >{t`Copy`}</Button>
    </StyledContainer>
  );
};

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconCopy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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
        Icon={IconCopy}
        title={t`Copy`}
        onClick={() => {
          copyToClipboard(apiKey, t`API Key copied to clipboard`);
        }}
      />
    </StyledContainer>
  );
};

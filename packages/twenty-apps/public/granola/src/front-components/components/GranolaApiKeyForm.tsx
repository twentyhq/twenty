import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';

const StyledKeyRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type GranolaApiKeyFormProps = {
  errorMessage: string | undefined;
  isConnectDisabled: boolean;
  onConnect: (apiKey: string) => void;
};

export const GranolaApiKeyForm = ({
  errorMessage,
  isConnectDisabled,
  onConnect,
}: GranolaApiKeyFormProps) => {
  const inputId = useId();
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  const trimmedApiKeyDraft = apiKeyDraft.trim();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isConnectDisabled || !isNonEmptyString(trimmedApiKeyDraft)) {
      return;
    }

    onConnect(trimmedApiKeyDraft);
  };

  return (
    <form onSubmit={handleSubmit}>
      <LabelledSettingsField
        label={t('API key')}
        inputId={inputId}
        errorMessage={errorMessage}
      >
        <StyledKeyRow>
          <StyledSettingsTextInput
            id={inputId}
            type="password"
            autoComplete="off"
            placeholder="grn_…"
            value={apiKeyDraft}
            onChange={(event) => setApiKeyDraft(event.target.value)}
          />
          <Button
            type="submit"
            title={t('Connect')}
            accent="blue"
            disabled={
              isConnectDisabled || !isNonEmptyString(trimmedApiKeyDraft)
            }
          />
        </StyledKeyRow>
      </LabelledSettingsField>
    </form>
  );
};

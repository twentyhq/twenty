import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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
      <Field.Root>
        <Field.Label>{t('API key')}</Field.Label>
        <StyledKeyRow>
          <Input
            type="password"
            autoComplete="off"
            placeholder="grn_…"
            value={apiKeyDraft}
            onValueChange={setApiKeyDraft}
          />
          <Button
            type="submit"
            variant="solid"
            color="accent"
            disabled={
              isConnectDisabled || !isNonEmptyString(trimmedApiKeyDraft)
            }
          >
            {t('Connect')}
          </Button>
        </StyledKeyRow>
        {isNonEmptyString(errorMessage) && (
          <Field.Error match>{errorMessage}</Field.Error>
        )}
      </Field.Root>
    </form>
  );
};

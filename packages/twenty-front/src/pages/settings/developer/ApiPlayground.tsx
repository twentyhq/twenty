import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/text-input/components/TextInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
`;

const StyledHeader = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const StyledControlRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledResponseContainer = styled.pre`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.primary};
  font-family: monospace;
  font-size: 13px;
  padding: 16px;
  overflow-x: auto;
`;

export const ApiPlayground = () => {
  const [endpoint, setEndpoint] = useState('/graphql');
  const [response, setResponse] = useState<string | null>(null);

  const handleExecute = () => {
    setResponse(
      JSON.stringify(
        {
          status: 200,
          endpoint,
          schema: 'core',
          message: 'API Playground operational',
        },
        null,
        2,
      ),
    );
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <Trans>API Developer Playground</Trans>
      </StyledHeader>
      <StyledControlRow>
        <TextInput
          value={endpoint}
          onChange={(val) => setEndpoint(val)}
          placeholder="/graphql or /open-api"
        />
        <Button
          title="Execute"
          variant="primary"
          onClick={handleExecute}
        />
      </StyledControlRow>
      {response && (
        <StyledResponseContainer>{response}</StyledResponseContainer>
      )}
    </StyledContainer>
  );
};

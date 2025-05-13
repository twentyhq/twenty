/* eslint-disable prettier/prettier */
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationFocusNfeConnectionFormValues } from '~/pages/settings/integrations/focus-nfe/SettingsIntegrationFocusNfeNewConnection';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: 15px;
  width: 100%;
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledFullWidthInput = styled.div`
  width: 100%;
`;

const StyledHalfWidthInput = styled.div`
  width: 50%;
`;

type SettingsIntegrationFocusNfeDatabaseConnectionFormProps = {
  disabled?: boolean;
};

export const SettingsIntegrationFocusNfeDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationFocusNfeDatabaseConnectionFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsIntegrationFocusNfeConnectionFormValues>();

  return (
    <StyledFormContainer>
      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="integrationName"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                label="Integration name"
                value={value as string}
                onChange={onChange}
                type="text"
                disabled={disabled}
                placeholder="Focus Nfe"
                fullWidth
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="token"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                label="Token"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="************************"
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>
    </StyledFormContainer>
  );
};

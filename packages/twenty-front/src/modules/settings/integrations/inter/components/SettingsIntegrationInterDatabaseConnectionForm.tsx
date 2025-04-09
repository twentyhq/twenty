/* eslint-disable prettier/prettier */
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';

import { FileDropZone } from '@/settings/integrations/inter/components/FileDropZone';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { SettingsIntegrationInterConnectionFormValues } from '~/pages/settings/integrations/inter/SettingsIntegrationInterNewDatabaseConnection';

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

type SettingsIntegrationInterDatabaseConnectionFormProps = {
  disabled?: boolean;
};

export const SettingsIntegrationInterDatabaseConnectionForm = ({
  disabled,
}: SettingsIntegrationInterDatabaseConnectionFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsIntegrationInterConnectionFormValues>();

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
                placeholder="Banco Inter"
                fullWidth
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledHalfWidthInput>
          <Controller
            name="clientId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                autoComplete="new-password"
                label="Client ID"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
              />
            )}
          />
        </StyledHalfWidthInput>

        <StyledHalfWidthInput>
          <Controller
            name="clientSecret"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInputV2
                autoComplete="new-password"
                label="Client Secret"
                value={value as string}
                onChange={onChange}
                fullWidth
                type="text"
                disabled={disabled}
                placeholder="********_****_****_****_****"
              />
            )}
          />
        </StyledHalfWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledFullWidthInput>
          <FileDropZone
            label="Private Key"
            accept=".pem,.key"
            file={watch('privateKey') as File | null}
            onFileSelected={(file) => setValue('privateKey', file)}
            onFileRemoved={() => setValue('privateKey', undefined)}
            disabled={disabled}
          />
        </StyledFullWidthInput>
      </StyledRow>

      <StyledRow>
        <StyledFullWidthInput>
          <FileDropZone
            label="Certificate"
            accept=".pem,.crt,.cer"
            file={watch('certificate')}
            onFileSelected={(file) => setValue('certificate', file)}
            onFileRemoved={() => setValue('certificate', undefined)}
            disabled={disabled}
          />
        </StyledFullWidthInput>
      </StyledRow>
    </StyledFormContainer>
  );
};

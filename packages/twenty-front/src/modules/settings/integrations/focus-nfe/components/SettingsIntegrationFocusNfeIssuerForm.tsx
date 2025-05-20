/* eslint-disable react/jsx-props-no-spreading */
import { Select } from '@/ui/input/components/Select';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { IssuerFormValues } from '~/types/Issuer';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)}; // Matches image somewhat
  width: 100%;
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  align-items: flex-start; // Align items to the start for varying heights
`;

const StyledFormFieldContainer = styled.div<{ width?: string }>`
  width: ${({ width = '100%' }) => width};
`;

const StyledAddressGroupContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) =>
    theme.spacing(2)}; // Spacing before address group
`;

const StyledFormTitle = styled.h4`
  // For "Issuer data" or "Address"
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)}; // Space after title
`;

type SettingsIntegrationFocusNfeIssuerFormProps = {
  disabled?: boolean;
};

const taxRegimeOptions = [
  { value: '', label: 'Select a tax regime' },
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
];

export const SettingsIntegrationFocusNfeIssuerForm = ({
  disabled,
}: SettingsIntegrationFocusNfeIssuerFormProps) => {
  const { control } = useFormContext<IssuerFormValues>();

  // TODO: Add masks for CNPJ, CPF, CEP, IE, CNAE if available/needed
  // For now, they are simple text inputs.

  return (
    <StyledFormContainer>
      <StyledFormTitle>Issuer data</StyledFormTitle>
      <StyledFormFieldContainer>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextInputV2
              label="Issuer name (company name)"
              {...field}
              disabled={disabled}
              placeholder="Focus NFe"
              fullWidth
              error={error?.message}
            />
          )}
        />
      </StyledFormFieldContainer>

      <StyledRow>
        <StyledFormFieldContainer width="50%">
          <Controller
            name="cnpj"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInputV2
                label="CNPJ"
                {...field}
                disabled={disabled}
                placeholder="99.999.999/9999-99"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>
        <StyledFormFieldContainer width="50%">
          <Controller
            name="cpf"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInputV2
                label="CPF"
                {...field}
                disabled={disabled}
                placeholder="999.999.999-99"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>
      </StyledRow>

      <StyledRow>
        <StyledFormFieldContainer width="50%">
          <Controller
            name="ie"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInputV2
                label="IE"
                {...field}
                disabled={disabled}
                placeholder="Add number"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>
        <StyledFormFieldContainer width="50%">
          <Controller
            name="cnaeCode"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInputV2
                label="CNAE Code"
                {...field}
                disabled={disabled}
                placeholder="****-*/ **"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>
      </StyledRow>

      <StyledAddressGroupContainer>
        {/* <StyledFormTitle>Address</StyledFormTitle> No separate title in image for address group */}
        <StyledFormFieldContainer>
          <Controller
            name="cep"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextInputV2
                label="CEP"
                {...field}
                disabled={disabled}
                placeholder="99.999-999"
                fullWidth
                error={error?.message}
              />
            )}
          />
        </StyledFormFieldContainer>

        <StyledRow>
          <StyledFormFieldContainer width="80%">
            <Controller
              name="street"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInputV2
                  label="Street"
                  {...field}
                  disabled={disabled}
                  placeholder="Add street"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
          <StyledFormFieldContainer width="20%">
            <Controller
              name="number"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInputV2
                  label="Number"
                  {...field}
                  disabled={disabled}
                  placeholder="Add number"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
        </StyledRow>

        <StyledRow>
          <StyledFormFieldContainer width="calc(45% - (${({ theme }) => theme.spacing(4)} / 3 * 2))">
            {' '}
            {/* Adjust for gap */}
            <Controller
              name="neighborhood"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInputV2
                  label="Neighborhood"
                  {...field}
                  disabled={disabled}
                  placeholder="Add neighborhood"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
          <StyledFormFieldContainer width="calc(45% - (${({ theme }) => theme.spacing(4)} / 3 * 2))">
            {' '}
            {/* Adjust for gap */}
            <Controller
              name="city"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInputV2
                  label="City"
                  {...field}
                  disabled={disabled}
                  placeholder="Add city"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
          <StyledFormFieldContainer width="calc(10% - (${({ theme }) => theme.spacing(4)} / 3 * 1))">
            {' '}
            {/* Adjust for gap */}
            <Controller
              name="state"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextInputV2
                  label="State"
                  {...field}
                  disabled={disabled}
                  placeholder="UF"
                  fullWidth
                  error={error?.message}
                />
              )}
            />
          </StyledFormFieldContainer>
        </StyledRow>
      </StyledAddressGroupContainer>

      <StyledFormFieldContainer>
        <Controller
          name="taxRegime"
          control={control}
          render={({ field }) => (
            <Select
              dropdownId={field.name}
              label="Tax regime"
              {...field}
              disabled={disabled}
              fullWidth
              options={taxRegimeOptions}
              emptyOption={taxRegimeOptions[0]}
            />
          )}
        />
      </StyledFormFieldContainer>
    </StyledFormContainer>
  );
};

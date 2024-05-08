import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';

// TODO: rename to SettingsDataModelFieldBooleanForm and move to settings/data-model/fields/forms/components

export const settingsDataModelFieldBooleanFormSchema = z.object({
  defaultValue: z.boolean(),
});

type SettingsDataModelFieldBooleanFormValues = z.infer<
  typeof settingsDataModelFieldBooleanFormSchema
>;

type SettingsDataModelFieldBooleanFormProps = {
  className?: string;
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue'>;
};

const StyledContainer = styled(CardContent)`
  padding-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: 6px;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDataModelFieldBooleanForm = ({
  className,
  fieldMetadataItem,
}: SettingsDataModelFieldBooleanFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldBooleanFormValues>();

  const initialValue = fieldMetadataItem?.defaultValue ?? true;

  return (
    <StyledContainer>
      <StyledLabel>Default Value</StyledLabel>
      <Controller
        name="defaultValue"
        control={control}
        defaultValue={initialValue}
        render={({ field: { onChange, value } }) => (
          <Select
            className={className}
            fullWidth
            dropdownId="object-field-default-value-select"
            value={value}
            onChange={onChange}
            options={[
              {
                value: true,
                label: 'True',
                Icon: IconCheck,
              },
              {
                value: false,
                label: 'False',
                Icon: IconX,
              },
            ]}
          />
        )}
      />
    </StyledContainer>
  );
};

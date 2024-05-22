import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { isDefined } from '~/utils/isDefined';

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
`;

export const SettingsDataModelFieldBooleanForm = ({
  className,
  fieldMetadataItem,
}: SettingsDataModelFieldBooleanFormProps) => {
  const { control, resetField } =
    useFormContext<SettingsDataModelFieldBooleanFormValues>();

  const isEditMode = isDefined(fieldMetadataItem?.defaultValue);
  const initialValue = fieldMetadataItem?.defaultValue ?? true;

  // Reset defaultValue on mount, so it doesn't conflict with other field types.
  useEffect(() => {
    resetField('defaultValue', { defaultValue: initialValue });
  }, [initialValue, resetField]);

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
            // TODO: temporary fix - disabling edition because after editing the defaultValue,
            // newly created records are not taking into account the updated defaultValue properly.
            disabled={isEditMode}
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

import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { getErrorMessageFromError } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';

export const settingsDataModelFieldIconLabelFormSchema = (
  existingOtherLabels: string[] = [],
) => {
  return fieldMetadataItemSchema(existingOtherLabels).pick({
    icon: true,
    label: true,
  });
};

type SettingsDataModelFieldIconLabelFormValues = z.infer<
  ReturnType<typeof settingsDataModelFieldIconLabelFormSchema>
>;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

type SettingsDataModelFieldIconLabelFormProps = {
  disabled?: boolean;
  fieldMetadataItem?: FieldMetadataItem;
  maxLength?: number;
};

export const SettingsDataModelFieldIconLabelForm = ({
  disabled,
  fieldMetadataItem,
  maxLength,
}: SettingsDataModelFieldIconLabelFormProps) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<SettingsDataModelFieldIconLabelFormValues>();

  return (
    <StyledInputsContainer>
      <Controller
        name="icon"
        control={control}
        defaultValue={fieldMetadataItem?.icon ?? 'IconUsers'}
        render={({ field: { onChange, value } }) => (
          <IconPicker
            disabled={disabled}
            selectedIconKey={value ?? ''}
            onChange={({ iconKey }) => onChange(iconKey)}
            variant="primary"
          />
        )}
      />
      <Controller
        name="label"
        control={control}
        defaultValue={fieldMetadataItem?.label}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Employees"
            value={value}
            onChange={(e) => {
              onChange(e);
              trigger('label');
            }}
            error={getErrorMessageFromError(errors.label?.message)}
            disabled={disabled}
            maxLength={maxLength}
            fullWidth
          />
        )}
      />
    </StyledInputsContainer>
  );
};

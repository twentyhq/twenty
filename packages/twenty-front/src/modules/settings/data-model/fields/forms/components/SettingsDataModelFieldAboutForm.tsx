import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

export const settingsDataModelFieldAboutFormSchema = (existingLabels?: string[]) => {
  return fieldMetadataItemSchema(existingLabels || []).pick({
    description: true,
    icon: true,
    label: true,
  });
};

// Correctly infer the type from the returned schema
type SettingsDataModelFieldAboutFormValues = z.infer<
  ReturnType<typeof settingsDataModelFieldAboutFormSchema>
>;

type SettingsDataModelFieldAboutFormProps = {
  disabled?: boolean;
  fieldMetadataItem?: FieldMetadataItem;
  maxLength?: number;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsDataModelFieldAboutForm = ({
  disabled,
  fieldMetadataItem,
  maxLength,
}: SettingsDataModelFieldAboutFormProps) => {
  const { control, trigger, formState: {errors} } = useFormContext<SettingsDataModelFieldAboutFormValues>();
  const validateLabel = () => {
    trigger('label')
  }
  console.log(errors.label, "errors near label")
  return (
    <>
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
                onChange(e)
                validateLabel()
              }}
              error={errors.label?.message=='Label must be unique' ? "This name is already taken": undefined}
              disabled={disabled}
              maxLength={maxLength}
              fullWidth
            />
          )}
        />
      </StyledInputsContainer>
      <Controller
        name="description"
        control={control}
        defaultValue={fieldMetadataItem?.description}
        render={({ field: { onChange, value } }) => (
          <TextArea
            placeholder="Write a description"
            minRows={4}
            value={value ?? undefined}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      />
    </>
  );
};

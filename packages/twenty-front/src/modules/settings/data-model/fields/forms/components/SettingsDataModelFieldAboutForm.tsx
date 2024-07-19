import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { getErrorMessageFromError } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

export const settingsDataModelFieldAboutFormSchema = (
  existingLabels?: string[],
) => {
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

const LABEL = 'label';

export const SettingsDataModelFieldAboutForm = ({
  disabled,
  fieldMetadataItem,
  maxLength,
}: SettingsDataModelFieldAboutFormProps) => {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<SettingsDataModelFieldAboutFormValues>();
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
          name={LABEL}
          control={control}
          defaultValue={fieldMetadataItem?.label}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Employees"
              value={value}
              onChange={(e) => {
                onChange(e);
                trigger(LABEL);
              }}
              error={getErrorMessageFromError(errors.label?.message)}
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

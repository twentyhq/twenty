import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { getErrorMessageFromError } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { RelationType } from '@/settings/data-model/types/RelationType';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { useEffect, useState } from 'react';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

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
  relationObjectMetadataItem?: ObjectMetadataItem;
  relationType?: RelationType;
};

export const SettingsDataModelFieldIconLabelForm = ({
  disabled,
  fieldMetadataItem,
  maxLength,
  relationObjectMetadataItem,
  relationType,
}: SettingsDataModelFieldIconLabelFormProps) => {
  const {
    control,
    trigger,
    formState: { errors },
    setValue,
  } = useFormContext<SettingsDataModelFieldIconLabelFormValues>();

  const [labelEditedManually, setLabelEditedManually] = useState(false);
  const [iconEditedManually, setIconEditedManually] = useState(false);

  useEffect(() => {
    if (labelEditedManually) return;
    const label = [
      RelationDefinitionType.ManyToOne,
      RelationDefinitionType.ManyToMany,
    ].includes(relationType ?? RelationDefinitionType.OneToMany)
      ? relationObjectMetadataItem?.labelPlural
      : relationObjectMetadataItem?.labelSingular;
    setValue('label', label ?? '');

    if (iconEditedManually) return;
    setValue('icon', relationObjectMetadataItem?.icon ?? 'IconUsers');
  }, [
    labelEditedManually,
    iconEditedManually,
    relationObjectMetadataItem,
    setValue,
    relationType,
  ]);

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
            onChange={({ iconKey }) => {
              setIconEditedManually(true);
              onChange(iconKey);
            }}
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
              setLabelEditedManually(true);
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

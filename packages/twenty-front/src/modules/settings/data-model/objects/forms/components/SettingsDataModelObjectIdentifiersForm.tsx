import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IconCircleOff, useIcons } from 'twenty-ui';
import { ZodError, isDirty, z } from 'zod';

import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/object-metadata/constants/LabelIdentifierFieldMetadataTypes';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';

export const settingsDataModelObjectIdentifiersFormSchema =
  objectMetadataItemSchema.pick({
    labelIdentifierFieldMetadataId: true,
    imageIdentifierFieldMetadataId: true,
  });

export type SettingsDataModelObjectIdentifiersFormValues = z.infer<
  typeof settingsDataModelObjectIdentifiersFormSchema
>;
export type SettingsDataModelObjectIdentifiers =
  keyof SettingsDataModelObjectIdentifiersFormValues;
type SettingsDataModelObjectIdentifiersFormProps = {
  objectMetadataItem: ObjectMetadataItem;
};
const LABEL_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'labelIdentifierFieldMetadataId';
const IMAGE_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'imageIdentifierFieldMetadataId';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsDataModelObjectIdentifiersForm = ({
  objectMetadataItem,
}: SettingsDataModelObjectIdentifiersFormProps) => {
  const formConfig = useForm<SettingsDataModelObjectIdentifiersFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectIdentifiersFormSchema),
  });
  const { enqueueSnackBar } = useSnackBar();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleSave = async (
    formValues: SettingsDataModelObjectIdentifiersFormValues,
  ) => {
    if (!isDirty) {
      return;
    }

    try {
      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload: formValues,
      });

      formConfig.reset(undefined, { keepValues: true });
    } catch (error) {
      if (error instanceof ZodError) {
        enqueueSnackBar(error.issues[0].message, {
          variant: SnackBarVariant.Error,
        });
      } else {
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      }
    }
  };

  const { getIcon } = useIcons();
  const labelIdentifierFieldOptions = useMemo(
    () =>
      getActiveFieldMetadataItems(objectMetadataItem)
        .filter(
          ({ id, type }) =>
            LABEL_IDENTIFIER_FIELD_METADATA_TYPES.includes(type) ||
            objectMetadataItem.labelIdentifierFieldMetadataId === id,
        )
        .map<SelectOption<string | null>>((fieldMetadataItem) => ({
          Icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          value: fieldMetadataItem.id,
        })),
    [getIcon, objectMetadataItem],
  );
  const imageIdentifierFieldOptions: SelectOption<string | null>[] = [];

  const emptyOption: SelectOption<string | null> = {
    Icon: IconCircleOff,
    label: 'None',
    value: null,
  };
  return (
    <StyledContainer>
      {[
        {
          label: t`Record label`,
          fieldName: LABEL_IDENTIFIER_FIELD_METADATA_ID,
          options: labelIdentifierFieldOptions,
          defaultValue: objectMetadataItem.labelIdentifierFieldMetadataId,
        },
        {
          label: t`Record image`,
          fieldName: IMAGE_IDENTIFIER_FIELD_METADATA_ID,
          options: imageIdentifierFieldOptions,
          defaultValue: null,
        },
      ].map(({ fieldName, label, options, defaultValue }) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={formConfig.control}
          defaultValue={defaultValue}
          render={({ field: { onChange, value } }) => (
            <Select
              label={label}
              disabled={!objectMetadataItem.isCustom || !options.length}
              fullWidth
              dropdownId={`${fieldName}-select`}
              emptyOption={emptyOption}
              options={options}
              value={value}
              onChange={(value) => {
                onChange(value);
                formConfig.handleSubmit(handleSave)();
              }}
            />
          )}
        />
      ))}
    </StyledContainer>
  );
};

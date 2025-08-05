import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ZodError, isDirty, z } from 'zod';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { useNavigate } from 'react-router-dom';
import { isLabelIdentifierFieldMetadataTypes } from 'twenty-shared/utils';
import { IconCircleOff, IconPlus, useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

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
  const { enqueueErrorSnackBar } = useSnackBar();
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
        enqueueErrorSnackBar({
          message: error.issues[0].message,
        });
      } else {
        enqueueErrorSnackBar({
          apolloError: error instanceof ApolloError ? error : undefined,
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
            isLabelIdentifierFieldMetadataTypes(type) ||
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

  const navigate = useNavigate();

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
              fullWidth
              dropdownId={`${fieldName}-select`}
              emptyOption={emptyOption}
              options={options}
              value={value}
              withSearchInput={label === t`Record label`}
              disabled={!objectMetadataItem.isCustom}
              callToActionButton={
                label === t`Record label`
                  ? {
                      text: 'Create Text Field',
                      Icon: IconPlus,
                      onClick: () => {
                        navigate('./new-field/select');
                      },
                    }
                  : undefined
              }
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

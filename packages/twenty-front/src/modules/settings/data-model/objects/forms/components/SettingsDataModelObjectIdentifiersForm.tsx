import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  isImageIdentifierFieldMetadataType,
  isLabelIdentifierFieldMetadataTypes,
  isSearchableFieldType,
} from 'twenty-shared/utils';
import { IconCircleOff, IconPlus, useIcons } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type z } from 'zod';

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
  objectMetadataItem: EnrichedObjectMetadataItem;
};
const LABEL_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'labelIdentifierFieldMetadataId';
const IMAGE_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'imageIdentifierFieldMetadataId';

const StyledContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsDataModelObjectIdentifiersForm = ({
  objectMetadataItem,
}: SettingsDataModelObjectIdentifiersFormProps) => {
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const isCustomObject = getIsMetadataItemCustom(objectMetadataItem);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;
  const formConfig = useForm<SettingsDataModelObjectIdentifiersFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectIdentifiersFormSchema),
  });
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleSave = async (
    formValues: SettingsDataModelObjectIdentifiersFormValues,
  ) => {
    const {
      labelIdentifierFieldMetadataId: _labelIdentifierFieldMetadataId,
      ...payloadWithoutLabelIdentifier
    } = formValues;

    const updatePayload = isCustomObject
      ? formValues
      : payloadWithoutLabelIdentifier;

    const result = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload,
    });

    if (result.status === 'successful') {
      formConfig.reset(undefined, { keepValues: true });
    }
  };

  const { getIcon } = useIcons();

  const mapFieldToSelectOption = (
    fieldMetadataItem: FieldMetadataItem,
  ): SelectOption<string | null> => ({
    Icon: getIcon(fieldMetadataItem.icon),
    label: fieldMetadataItem.label,
    value: fieldMetadataItem.id,
  });

  const labelIdentifierFieldOptions = getActiveFieldMetadataItems(
    objectMetadataItem,
  )
    .filter(
      ({ id, type }) =>
        (isLabelIdentifierFieldMetadataTypes(type) &&
          isSearchableFieldType(type)) ||
        objectMetadataItem.labelIdentifierFieldMetadataId === id,
    )
    .map(mapFieldToSelectOption);

  const emptyOption: SelectOption<string | null> = {
    Icon: IconCircleOff,
    label: t`None`,
    value: null,
  };

  const imageIdentifierFieldOptions = [
    emptyOption,
    ...getActiveFieldMetadataItems(objectMetadataItem)
      .filter(
        ({ id, type }) =>
          isImageIdentifierFieldMetadataType(type) ||
          objectMetadataItem.imageIdentifierFieldMetadataId === id,
      )
      .map(mapFieldToSelectOption),
  ];

  const navigate = useNavigate();

  return (
    <StyledContainer>
      {[
        {
          label: t`Record label`,
          fieldName: LABEL_IDENTIFIER_FIELD_METADATA_ID,
          options: labelIdentifierFieldOptions,
          defaultValue: objectMetadataItem.labelIdentifierFieldMetadataId,
          disabled: !isCustomObject || readonly,
        },
        {
          label: t`Record image`,
          fieldName: IMAGE_IDENTIFIER_FIELD_METADATA_ID,
          options: imageIdentifierFieldOptions,
          defaultValue: objectMetadataItem.imageIdentifierFieldMetadataId,
          disabled: readonly,
        },
      ].map(({ fieldName, label, options, defaultValue, disabled }) => (
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
              disabled={disabled}
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
              onChange={(newValue) => {
                onChange(newValue);
                formConfig.handleSubmit(handleSave)();
              }}
            />
          )}
        />
      ))}
    </StyledContainer>
  );
};

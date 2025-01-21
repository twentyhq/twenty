import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { IconCircleOff, useIcons } from 'twenty-ui';
import { z } from 'zod';

import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/object-metadata/constants/LabelIdentifierFieldMetadataTypes';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { Select, SelectOption } from '@/ui/input/components/Select';

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
  defaultLabelIdentifierFieldMetadataId: string | null;
  onBlur: () => void;
};
const LABEL_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers = 'labelIdentifierFieldMetadataId';
const IMAGE_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers = 'imageIdentifierFieldMetadataId';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsDataModelObjectIdentifiersForm = ({
  objectMetadataItem,
  defaultLabelIdentifierFieldMetadataId,
  onBlur
}: SettingsDataModelObjectIdentifiersFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelObjectIdentifiersFormValues>();
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
      {(
        [
          {
            label: 'Record label',
            fieldName: LABEL_IDENTIFIER_FIELD_METADATA_ID,
            options: labelIdentifierFieldOptions,
            defaultValue:
              objectMetadataItem[
                LABEL_IDENTIFIER_FIELD_METADATA_ID
              ] ?? defaultLabelIdentifierFieldMetadataId, // defaultLabelIdentifierFieldMetadataId as in injected as any could be undefined 
          },
          {
            label: 'Record image',
            fieldName: IMAGE_IDENTIFIER_FIELD_METADATA_ID,
            options: imageIdentifierFieldOptions,
            defaultValue: null,
          },
        ]
      ).map(({ fieldName, label, options, defaultValue}) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={control}
          defaultValue={defaultValue}
          render={({ field: {onChange, value } }) => (
            <Select
              label={label}
              disabled={!objectMetadataItem.isCustom || !options.length}
              fullWidth
              dropdownId={`${fieldName}-select`}
              emptyOption={emptyOption}
              options={options}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
      ))}
    </StyledContainer>
  );
};

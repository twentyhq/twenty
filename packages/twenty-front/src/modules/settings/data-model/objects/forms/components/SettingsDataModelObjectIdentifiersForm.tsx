import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { IconCircleOff, isDefined, useIcons } from 'twenty-ui';
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

type SettingsDataModelObjectIdentifiersFormProps = {
  objectMetadataItem: ObjectMetadataItem;
  defaultLabelIdentifierFieldMetadataId: string;
};

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsDataModelObjectIdentifiersForm = ({
  objectMetadataItem,
  defaultLabelIdentifierFieldMetadataId,
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
      {[
        {
          label: 'Record label',
          fieldName: 'labelIdentifierFieldMetadataId' as const,
          options: labelIdentifierFieldOptions,
        },
        {
          label: 'Record image',
          fieldName: 'imageIdentifierFieldMetadataId' as const,
          options: imageIdentifierFieldOptions,
        },
      ].map(({ fieldName, label, options }) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={control}
          defaultValue={
            fieldName === 'labelIdentifierFieldMetadataId'
              ? isDefined(objectMetadataItem[fieldName])
                ? objectMetadataItem[fieldName]
                : defaultLabelIdentifierFieldMetadataId
              : objectMetadataItem[fieldName]
          }
          render={({ field: { onBlur, onChange, value } }) => {
            return (
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
            );
          }}
        />
      ))}
    </StyledContainer>
  );
};

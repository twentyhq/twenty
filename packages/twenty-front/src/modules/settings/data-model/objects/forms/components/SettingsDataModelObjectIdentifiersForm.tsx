import styled from '@emotion/styled';
import { useMemo } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import { IconCircleOff, useIcons } from 'twenty-ui';
import { z } from 'zod';

import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/object-metadata/constants/LabelIdentifierFieldMetadataTypes';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { Maybe } from 'graphql/jsutils/Maybe';

export const settingsDataModelObjectIdentifiersFormSchema =
  objectMetadataItemSchema.pick({
    labelIdentifierFieldMetadataId: true,
    imageIdentifierFieldMetadataId: true,
  });

export type SettingsDataModelObjectIdentifiersFormValues = z.infer<
  typeof settingsDataModelObjectIdentifiersFormSchema
>;
export type SettingsDataModelIdentifiers =
  keyof SettingsDataModelObjectIdentifiersFormValues;
type SettingsDataModelObjectIdentifiersFormProps = {
  objectMetadataItem: ObjectMetadataItem;
  defaultLabelIdentifierFieldMetadataId: string;
};
// Could this be done using generic ?
type AllObjectMetadataIdentifiers = {
  label: string;
  fieldName: SettingsDataModelIdentifiers;
  options: SelectOption<string | null>[];
  defaultValue: Maybe<string> | undefined;
  rules?: ControllerProps['rules']
}[];

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
  // Should we declare below array within component function to avoid satisfies assertion
  return (
    <StyledContainer>
      {(
        [
          {
            label: 'Record label',
            fieldName: 'labelIdentifierFieldMetadataId',
            options: labelIdentifierFieldOptions,
            defaultValue:
              objectMetadataItem[
                'labelIdentifierFieldMetadataId' satisfies SettingsDataModelIdentifiers
              ] ?? defaultLabelIdentifierFieldMetadataId,
          },
          {
            label: 'Record image',
            fieldName: 'imageIdentifierFieldMetadataId',
            options: imageIdentifierFieldOptions,
            defaultValue: undefined,
          },
        ] satisfies AllObjectMetadataIdentifiers
      ).map(({ fieldName, label, options, defaultValue}) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={control}
          defaultValue={defaultValue}
          render={({ field: { onBlur, onChange, value } }) => (
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

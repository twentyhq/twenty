import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';
import { z } from 'zod';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { RelationMetadataType } from '~/generated-metadata/graphql';

import { RELATION_TYPES } from '../constants/RelationTypes';
import { RelationType } from '../types/RelationType';

// TODO: rename to SettingsDataModelFieldRelationForm and move to settings/data-model/fields/forms/components

export const settingsDataModelFieldRelationFormSchema = z.object({
  relation: z.object({
    field: fieldMetadataItemSchema.pick({
      icon: true,
      label: true,
    }),
    objectMetadataId: z.string().uuid(),
    type: z.enum(
      Object.keys(RELATION_TYPES) as [RelationType, ...RelationType[]],
    ),
  }),
});

type SettingsDataModelFieldRelationFormValues = z.infer<
  typeof settingsDataModelFieldRelationFormSchema
>;

type SettingsDataModelFieldRelationFormProps = {
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'fromRelationMetadata' | 'toRelationMetadata' | 'type'
  >;
};

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSelectsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: 1fr 1fr;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledInputsLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const RELATION_TYPE_OPTIONS = Object.entries(RELATION_TYPES)
  .filter(([value]) => 'ONE_TO_ONE' !== value)
  .map(([value, { label, Icon }]) => ({
    label,
    value: value as RelationType,
    Icon,
  }));

export const SettingsDataModelFieldRelationForm = ({
  fieldMetadataItem,
}: SettingsDataModelFieldRelationFormProps) => {
  const { control } =
    useFormContext<SettingsDataModelFieldRelationFormValues>();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const getRelationMetadata = useGetRelationMetadata();
  const {
    relationFieldMetadataItem,
    relationType,
    relationObjectMetadataItem,
  } =
    useMemo(
      () =>
        fieldMetadataItem ? getRelationMetadata({ fieldMetadataItem }) : null,
      [fieldMetadataItem, getRelationMetadata],
    ) ?? {};

  const disableFieldEdition =
    relationFieldMetadataItem && !relationFieldMetadataItem.isCustom;

  const disableRelationEdition = !!relationFieldMetadataItem;

  const selectedObjectMetadataItem =
    relationObjectMetadataItem ?? objectMetadataItems[0];

  return (
    <StyledContainer>
      <StyledSelectsContainer>
        <Controller
          name="relation.type"
          control={control}
          defaultValue={relationType ?? RelationMetadataType.OneToMany}
          render={({ field: { onChange, value } }) => (
            <Select
              label="Relation type"
              dropdownId="relation-type-select"
              fullWidth
              disabled={disableRelationEdition}
              value={value}
              options={RELATION_TYPE_OPTIONS}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name="relation.objectMetadataId"
          control={control}
          defaultValue={selectedObjectMetadataItem?.id}
          render={({ field: { onChange, value } }) => (
            <Select
              label="Object destination"
              dropdownId="object-destination-select"
              fullWidth
              disabled={disableRelationEdition}
              value={value}
              options={objectMetadataItems
                .filter(isObjectMetadataAvailableForRelation)
                .map((objectMetadataItem) => ({
                  label: objectMetadataItem.labelPlural,
                  value: objectMetadataItem.id,
                  Icon: getIcon(objectMetadataItem.icon),
                }))}
              onChange={onChange}
            />
          )}
        />
      </StyledSelectsContainer>
      <StyledInputsLabel>
        Field on {selectedObjectMetadataItem?.labelPlural}
      </StyledInputsLabel>
      <StyledInputsContainer>
        <Controller
          name="relation.field.icon"
          control={control}
          defaultValue={
            relationFieldMetadataItem?.icon ??
            relationObjectMetadataItem?.icon ??
            'IconUsers'
          }
          render={({ field: { onChange, value } }) => (
            <IconPicker
              disabled={disableFieldEdition}
              dropdownId="field-destination-icon-picker"
              selectedIconKey={value ?? undefined}
              onChange={({ iconKey }) => onChange(iconKey)}
              variant="primary"
            />
          )}
        />
        <Controller
          name="relation.field.label"
          control={control}
          defaultValue={relationFieldMetadataItem?.label}
          render={({ field: { onChange, value } }) => (
            <TextInput
              disabled={disableFieldEdition}
              placeholder="Field name"
              value={value}
              onChange={onChange}
              fullWidth
            />
          )}
        />
      </StyledInputsContainer>
    </StyledContainer>
  );
};

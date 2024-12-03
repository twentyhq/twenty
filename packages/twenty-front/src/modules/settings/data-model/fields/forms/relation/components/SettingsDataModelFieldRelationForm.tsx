import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { useIcons } from 'twenty-ui';
import { z } from 'zod';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { useRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/relation/hooks/useRelationSettingsFormInitialValues';
import { RelationType } from '@/settings/data-model/types/RelationType';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { RelationDefinitionType } from '~/generated-metadata/graphql';

export const settingsDataModelFieldRelationFormSchema = z.object({
  relation: z.object({
    field: fieldMetadataItemSchema()
      .pick({
        icon: true,
        label: true,
      })
      // NOT SURE IF THIS IS CORRECT
      .merge(
        fieldMetadataItemSchema()
          .pick({
            name: true,
            isLabelSyncedWithName: true,
          })
          .partial(),
      ),
    objectMetadataId: z.string().uuid(),
    type: z.enum(
      Object.keys(RELATION_TYPES) as [
        RelationDefinitionType,
        ...RelationDefinitionType[],
      ],
    ),
  }),
});

export type SettingsDataModelFieldRelationFormValues = z.infer<
  typeof settingsDataModelFieldRelationFormSchema
>;

type SettingsDataModelFieldRelationFormProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type'>;
  objectMetadataItem: ObjectMetadataItem;
};

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSelectsContainer = styled.div<{ isMobile: boolean }>`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: ${({ isMobile }) => (isMobile ? '1fr' : '1fr 1fr')};
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
  .filter(
    ([value]) =>
      RelationDefinitionType.OneToOne !== value &&
      RelationDefinitionType.ManyToMany !== value,
  )
  .map(([value, { label, Icon }]) => ({
    label,
    value: value as RelationType,
    Icon,
  }));

export const SettingsDataModelFieldRelationForm = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldRelationFormProps) => {
  const { control, watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldRelationFormValues>();
  const { getIcon } = useIcons();
  const { objectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  const {
    disableFieldEdition,
    disableRelationEdition,
    initialRelationFieldMetadataItem,
    initialRelationObjectMetadataItem,
    initialRelationType,
  } = useRelationSettingsFormInitialValues({
    fieldMetadataItem,
    objectMetadataItem,
  });

  const selectedObjectMetadataItem = findObjectMetadataItemById(
    watchFormValue(
      'relation.objectMetadataId',
      initialRelationObjectMetadataItem?.id,
    ),
  );

  const selectedRelationType = watchFormValue(
    'relation.type',
    initialRelationType,
  );

  const isMobile = useIsMobile();

  return (
    <StyledContainer>
      <StyledSelectsContainer isMobile={isMobile}>
        <Controller
          name="relation.type"
          control={control}
          defaultValue={initialRelationType}
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
          defaultValue={initialRelationObjectMetadataItem.id}
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
        Field on{' '}
        {selectedRelationType === RelationDefinitionType.ManyToOne
          ? selectedObjectMetadataItem?.labelSingular
          : selectedObjectMetadataItem?.labelPlural}
      </StyledInputsLabel>
      <StyledInputsContainer>
        <Controller
          name="relation.field.icon"
          control={control}
          defaultValue={initialRelationFieldMetadataItem.icon}
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
          defaultValue={initialRelationFieldMetadataItem.label}
          render={({ field: { onChange, value } }) => (
            <TextInput
              disabled={disableFieldEdition}
              placeholder="Field name"
              value={value}
              onChange={onChange}
              fullWidth
              maxLength={FIELD_NAME_MAXIMUM_LENGTH}
            />
          )}
        />
      </StyledInputsContainer>
    </StyledContainer>
  );
};

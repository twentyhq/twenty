import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { useMorphRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/morphRelation/hooks/useMorphRelationSettingsFormInitialValues';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';

// todo @guillim : this is a copy of the relation form, we need to refactor it to be more morphspecific
export const settingsDataModelFieldMorphRelationFormSchema = z.object({
  morphRelations: z
    .array(
      z.object({
        value: fieldMetadataItemSchema()
          .pick({
            icon: true,
            label: true,
          })
          .merge(
            fieldMetadataItemSchema()
              .pick({
                name: true,
                isLabelSyncedWithName: true,
              })
              .partial(),
          ),
        objectMetadataId: z.string().uuid(),
        objectMetadataNameSingular: z.string().min(1),
      }),
    )
    .min(2),
  type: z.enum(
    Object.keys(RELATION_TYPES) as [RelationType, ...RelationType[]],
  ),
  fieldOnDestination: z.string().min(1),
  iconOnDestination: z.string().min(1),
});

export type SettingsDataModelFieldMorphRelationFormValues = z.infer<
  typeof settingsDataModelFieldMorphRelationFormSchema
>;

type SettingsDataModelFieldMorphRelationFormProps = {
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

const RELATION_TYPE_OPTIONS = Object.entries(RELATION_TYPES).map(
  ([value, { label, Icon }]) => ({
    label,
    value: value as RelationType,
    Icon,
  }),
);

export const SettingsDataModelFieldMorphRelationForm = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldMorphRelationFormProps) => {
  const { t } = useLingui();
  const { control, watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();
  const { getIcon } = useIcons();
  const { activeObjectMetadataItems, findObjectMetadataItemById } =
    useFilteredObjectMetadataItems();

  // we should see if we authorize or not the edition of these fields for moprh
  const {
    disableFieldEdition,
    disableRelationEdition,
    initialRelationObjectMetadataItems,
    initialRelationType,
  } = useMorphRelationSettingsFormInitialValues({
    fieldMetadataItem,
    objectMetadataItem,
  });

  // todo tmp @guillim remove this when ready
  const firstInitialRelationObjectMetadataItem =
    initialRelationObjectMetadataItems[0];
  const firstInitialRelationFieldMetadataItem = {
    icon: firstInitialRelationObjectMetadataItem.icon ?? 'IconUsers',
    label: [RelationType.MANY_TO_ONE].includes(initialRelationType)
      ? firstInitialRelationObjectMetadataItem.labelPlural
      : firstInitialRelationObjectMetadataItem.labelSingular,
  };

  const secondInitialRelationObjectMetadataItem =
    initialRelationObjectMetadataItems[1];
  const secondInitialRelationFieldMetadataItem = {
    icon: secondInitialRelationObjectMetadataItem.icon ?? 'IconUsers',
    label: secondInitialRelationObjectMetadataItem.labelPlural,
  };

  const initialMorphRelations = [
    {
      objectMetadataId: firstInitialRelationObjectMetadataItem.id,
      objectMetadataNameSingular:
        firstInitialRelationObjectMetadataItem.labelSingular,
      value: firstInitialRelationFieldMetadataItem,
    },
    {
      objectMetadataId: secondInitialRelationObjectMetadataItem.id,
      objectMetadataNameSingular:
        secondInitialRelationObjectMetadataItem.labelSingular,
      value: secondInitialRelationFieldMetadataItem,
    },
  ];
  const isMobile = useIsMobile();

  return (
    <StyledContainer>
      <StyledSelectsContainer isMobile={isMobile}>
        <Controller
          name="type"
          control={control}
          defaultValue={initialRelationType}
          render={({ field: { onChange, value } }) => (
            <Select
              label={t`Relation type`}
              dropdownId="relation-type-select"
              fullWidth
              disabled={disableRelationEdition}
              value={value}
              options={RELATION_TYPE_OPTIONS}
              onChange={onChange} //todo @guillim: this is not working
            />
          )}
        />

        <Controller
          name="morphRelations"
          control={control}
          defaultValue={initialMorphRelations}
          render={({ field: { onChange, value } }) => (
            <SettingsMorphRelationMultiSelect
              label={t`Object destination`}
              dropdownId="object-destination-select"
              fullWidth
              disabled={disableRelationEdition}
              value={value}
              withSearchInput={true}
              options={activeObjectMetadataItems
                .filter(isObjectMetadataAvailableForRelation)
                .sort((item1, item2) =>
                  item1.labelPlural.localeCompare(item2.labelPlural),
                )
                .map((objectMetadataItem) => ({
                  label: objectMetadataItem.labelSingular,
                  Icon: getIcon(objectMetadataItem.icon),
                  value: {
                    objectMetadataId: objectMetadataItem.id,
                    objectMetadataNameSingular:
                      objectMetadataItem.labelSingular,
                    icon: getIcon(objectMetadataItem.icon),
                  },
                }))}
              onChange={onChange}
            />
          )}
        />
      </StyledSelectsContainer>
      <StyledInputsLabel>{t`Field on destination`}</StyledInputsLabel>
      <StyledInputsContainer>
        <Controller
          name="iconOnDestination"
          control={control}
          defaultValue={firstInitialRelationFieldMetadataItem.icon}
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
          name="fieldOnDestination"
          control={control}
          defaultValue={firstInitialRelationFieldMetadataItem.label}
          render={({ field: { onChange, value } }) => (
            <SettingsTextInput
              instanceId="relation-field-label"
              disabled={disableFieldEdition}
              placeholder={t`Field name`}
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

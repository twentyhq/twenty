import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { useMorphRelationSettingsFormDefaultValuesOnDestination } from '@/settings/data-model/fields/forms/morph-relation/hooks/useMorphRelationSettingsFormDefaultValuesOnDestination';
import { useMorphRelationSettingsFormInitialTargetMetadatas } from '@/settings/data-model/fields/forms/morph-relation/hooks/useMorphRelationSettingsFormInitialTargetMetadatas';
import { fieldMetadataItemDisableFieldEdition } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemDisableFieldEdition';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations';

import { fieldMetadataItemInitialRelationType } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemInitialRelationType';
import {
  RELATION_TYPE_OPTIONS,
  StyledInputsContainer,
  StyledInputsLabel,
  StyledSelectsContainer,
} from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useLingui } from '@lingui/react/macro';
import { type RelationType } from '~/generated-metadata/graphql';

export const settingsDataModelFieldMorphRelationFormSchema = z.object({
  morphRelationObjectMetadataIds: z.array(z.string().uuid()).min(2),
  relationType: z.enum(
    Object.keys(RELATION_TYPES) as [RelationType, ...RelationType[]],
  ),
  targetFieldLabel: z.string().min(1),
  iconOnDestination: z.string().min(1),
});

export type SettingsDataModelFieldMorphRelationFormValues = z.infer<
  typeof settingsDataModelFieldMorphRelationFormSchema
>;

type SettingsDataModelFieldMorphRelationFormProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
};

export const SettingsDataModelFieldMorphRelationForm = ({
  fieldMetadataItem,
}: SettingsDataModelFieldMorphRelationFormProps) => {
  const { t } = useLingui();
  const { control } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();

  const morphRelationPreviouslyCreated =
    fieldMetadataItemHasMorphRelations(fieldMetadataItem);

  const disableRelationEdition = !!morphRelationPreviouslyCreated;
  const disableFieldEdition =
    fieldMetadataItemDisableFieldEdition(fieldMetadataItem);
  const initialRelationObjectMetadataItems =
    useMorphRelationSettingsFormInitialTargetMetadatas({
      fieldMetadataItem,
    });

  const initialRelationType =
    fieldMetadataItemInitialRelationType(fieldMetadataItem);

  const { label: defaultLabelOnDestination, icon: defaultIconOnDestination } =
    useMorphRelationSettingsFormDefaultValuesOnDestination({
      fieldMetadataItem,
      objectMetadataItem: initialRelationObjectMetadataItems[0],
      relationType: initialRelationType,
    });

  const initialMorphRelationsObjectMetadataIds =
    initialRelationObjectMetadataItems.map(
      (relationObjectMetadataItem) => relationObjectMetadataItem.id,
    );
  const isMobile = useIsMobile();

  return (
    <StyledContainer>
      <StyledSelectsContainer isMobile={isMobile}>
        <Controller
          name="relationType"
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
              onChange={onChange}
            />
          )}
        />

        <Controller
          name="morphRelationObjectMetadataIds"
          control={control}
          defaultValue={initialMorphRelationsObjectMetadataIds}
          render={({ field: { onChange, value } }) => (
            <SettingsMorphRelationMultiSelect
              label={t`Object destination`}
              dropdownId="object-destination-select"
              fullWidth
              disabled={disableRelationEdition}
              selectedObjectMetadataIds={value}
              withSearchInput={true}
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
          defaultValue={defaultIconOnDestination}
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
          name="targetFieldLabel"
          control={control}
          defaultValue={defaultLabelOnDestination}
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

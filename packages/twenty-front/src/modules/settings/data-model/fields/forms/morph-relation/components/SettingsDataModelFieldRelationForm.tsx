import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { useFieldMetadataItemDisableFieldEdition } from '@/settings/data-model/fields/forms/morph-relation/hooks/useFieldMetadataItemDisableFieldEdition';
import { useRelationSettingsFormDefaultValuesTargetFieldMetadata } from '@/settings/data-model/fields/forms/morph-relation/hooks/useRelationSettingsFormDefaultValuesTargetFieldMetadata';
import { useRelationSettingsFormInitialTargetObjectMetadatas } from '@/settings/data-model/fields/forms/morph-relation/hooks/useRelationSettingsFormInitialTargetObjectMetadatas';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

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

export const settingsDataModelFieldMorphRelationFormSchema = z.object({
  morphRelationObjectMetadataIds: z.array(z.uuid()).min(1),
  relationType: z.enum(
    Object.keys(RELATION_TYPES) as [RelationType, ...RelationType[]],
  ),
  targetFieldLabel: z.string().min(1),
  iconOnDestination: z.string().min(1),
  settings: z
    .object({
      junctionTargetFieldId: z.string().optional(),
    })
    .catchall(z.unknown())
    .optional(),
});

export type SettingsDataModelFieldMorphRelationFormValues = z.infer<
  typeof settingsDataModelFieldMorphRelationFormSchema
>;

type SettingsDataModelFieldRelationFormProps = {
  sourceObjectMetadataId: string;
  existingFieldMetadataId: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldRelationForm = ({
  existingFieldMetadataId,
  sourceObjectMetadataId,
  disabled = false,
}: SettingsDataModelFieldRelationFormProps) => {
  const { t } = useLingui();
  const { control, watch } = useFormContext();

  const currentIds = watch('morphRelationObjectMetadataIds') as
    | string[]
    | undefined;

  const isSelfInDestinationForMorphRelation =
    isDefined(currentIds) &&
    currentIds.length > 1 &&
    currentIds.includes(sourceObjectMetadataId);

  const { fieldMetadataItem: existingFieldMetadataItem } =
    useFieldMetadataItemById(existingFieldMetadataId);

  const disableRelationEdition = isDefined(existingFieldMetadataItem);
  const disableFieldEdition = useFieldMetadataItemDisableFieldEdition(
    existingFieldMetadataItem,
  );

  const initialRelationObjectMetadataItems =
    useRelationSettingsFormInitialTargetObjectMetadatas({
      fieldMetadataItem: existingFieldMetadataItem,
      sourceObjectMetadataId,
    });

  const initialRelationType =
    existingFieldMetadataItem?.relation?.type ?? RelationType.ONE_TO_MANY;

  const { label: defaultLabelOnDestination, icon: defaultIconOnDestination } =
    useRelationSettingsFormDefaultValuesTargetFieldMetadata({
      fieldMetadataItem: existingFieldMetadataItem,
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
              disabled={disabled || disableRelationEdition}
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
              error={
                isSelfInDestinationForMorphRelation
                  ? t`Relations cannot include the source object when multiple destinations are selected.`
                  : undefined
              }
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

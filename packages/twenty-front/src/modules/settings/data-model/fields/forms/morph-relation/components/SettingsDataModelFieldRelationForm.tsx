import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
import { useMemo } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Toggle } from 'twenty-ui/input';
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

const StyledJunctionSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledToggleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledToggleLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
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
  // Junction configuration for many-to-many relations
  junctionTargetRelationFieldIds: z.array(z.uuid()).optional(),
});

export type SettingsDataModelFieldMorphRelationFormValues = z.infer<
  typeof settingsDataModelFieldMorphRelationFormSchema
>;

type SettingsDataModelFieldRelationFormProps = {
  existingFieldMetadataId: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldRelationForm = ({
  existingFieldMetadataId,
  disabled = false,
}: SettingsDataModelFieldRelationFormProps) => {
  const { t } = useLingui();
  const { control, setValue } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();

  const {
    fieldMetadataItem: existingFieldMetadataItem,
    objectMetadataItem: sourceObjectMetadataItem,
  } = useFieldMetadataItemById(existingFieldMetadataId);

  const { objectMetadataItems } = useObjectMetadataItems();

  const disableRelationEdition = isDefined(existingFieldMetadataItem);
  const disableFieldEdition = useFieldMetadataItemDisableFieldEdition(
    existingFieldMetadataItem,
  );

  const initialRelationObjectMetadataItems =
    useRelationSettingsFormInitialTargetObjectMetadatas({
      fieldMetadataItem: existingFieldMetadataItem,
    });

  const initialRelationType =
    existingFieldMetadataItem?.settings?.relationType ??
    RelationType.ONE_TO_MANY;

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

  // Watch form values for junction configuration
  // Use defaultValue since the form doesn't set relationType in defaultValues initially
  const watchedRelationType =
    useWatch({ control, name: 'relationType' }) ?? initialRelationType;
  const watchedTargetObjectIds =
    useWatch({
      control,
      name: 'morphRelationObjectMetadataIds',
    }) ?? initialMorphRelationsObjectMetadataIds;
  const watchedJunctionTargetFieldIds = useWatch({
    control,
    name: 'junctionTargetRelationFieldIds',
  });

  // Get the junction object (target of the ONE_TO_MANY)
  const junctionObjectMetadataItem = useMemo(() => {
    if (
      watchedRelationType !== RelationType.ONE_TO_MANY ||
      !watchedTargetObjectIds ||
      watchedTargetObjectIds.length !== 1
    ) {
      return undefined;
    }
    return objectMetadataItems.find(
      (item) => item.id === watchedTargetObjectIds[0],
    );
  }, [watchedRelationType, watchedTargetObjectIds, objectMetadataItems]);

  // Get the source object ID (the object that owns the field we're editing)
  const sourceObjectMetadataId = sourceObjectMetadataItem?.id;

  // Get MANY_TO_ONE relation fields on the junction object, excluding the back-reference
  const junctionManyToOneFields = useMemo(() => {
    if (!junctionObjectMetadataItem) {
      return [];
    }
    return junctionObjectMetadataItem.fields.filter((field) => {
      // Must be a MANY_TO_ONE relation
      if (
        field.type !== FieldMetadataType.RELATION ||
        field.settings?.relationType !== RelationType.MANY_TO_ONE
      ) {
        return false;
      }
      // Exclude the back-reference (field pointing back to the source object)
      if (
        isDefined(sourceObjectMetadataId) &&
        field.relation?.targetObjectMetadata.id === sourceObjectMetadataId
      ) {
        return false;
      }
      return true;
    });
  }, [junctionObjectMetadataItem, sourceObjectMetadataId]);

  const isJunctionConfigEnabled =
    isDefined(watchedJunctionTargetFieldIds) &&
    watchedJunctionTargetFieldIds.length > 0;

  const handleJunctionToggle = (enabled: boolean) => {
    if (enabled && junctionManyToOneFields.length > 0) {
      // Auto-select the first available MANY_TO_ONE field (excluding the back-reference)
      const firstField = junctionManyToOneFields[0];
      setValue('junctionTargetRelationFieldIds', [firstField.id], {
        shouldDirty: true,
      });
    } else {
      setValue('junctionTargetRelationFieldIds', undefined, {
        shouldDirty: true,
      });
    }
  };

  const junctionFieldOptions = useMemo(
    () =>
      junctionManyToOneFields.map((field) => ({
        label: field.label,
        value: field.id,
      })),
    [junctionManyToOneFields],
  );

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

      {watchedRelationType === RelationType.ONE_TO_MANY &&
        isDefined(junctionObjectMetadataItem) &&
        junctionManyToOneFields.length > 0 && (
          <StyledJunctionSection>
            <StyledToggleContainer>
              <Toggle
                value={isJunctionConfigEnabled}
                onChange={handleJunctionToggle}
                disabled={disabled}
              />
              <StyledToggleLabel>{t`Many-to-many through junction`}</StyledToggleLabel>
            </StyledToggleContainer>

            {isJunctionConfigEnabled && (
              <>
                <StyledInputsLabel>{t`Target relation field on junction`}</StyledInputsLabel>
                <Controller
                  name="junctionTargetRelationFieldIds"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      dropdownId="junction-target-field-select"
                      fullWidth
                      disabled={disabled}
                      value={value?.[0]}
                      options={junctionFieldOptions}
                      onChange={(selectedFieldId) =>
                        onChange([selectedFieldId])
                      }
                    />
                  )}
                />
              </>
            )}
          </StyledJunctionSection>
        )}
    </StyledContainer>
  );
};

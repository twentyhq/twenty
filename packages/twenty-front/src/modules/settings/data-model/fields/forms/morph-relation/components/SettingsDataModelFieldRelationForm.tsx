import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { SettingsMorphRelationMultiSelect } from '@/settings/components/SettingsMorphRelationMultiSelect';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { useRelationSettingsFormDefaultValuesTargetFieldMetadata } from '@/settings/data-model/fields/forms/morph-relation/hooks/useRelationSettingsFormDefaultValuesTargetFieldMetadata';
import { useRelationSettingsFormInitialTargetObjectMetadatas } from '@/settings/data-model/fields/forms/morph-relation/hooks/useRelationSettingsFormInitialTargetObjectMetadatas';
import { useFieldMetadataItemDisableFieldEdition } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemDisableFieldEdition';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey, RelationType } from '~/generated-metadata/graphql';

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
  const { control } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();
  const { getIcon } = useIcons();
  const { fieldMetadataItem: existingFieldMetadataItem } =
    useFieldMetadataItemById(existingFieldMetadataId);

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

  const isMorphRelationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
  );

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

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
          render={({ field: { onChange, value } }) =>
            isMorphRelationEnabled ? (
              <SettingsMorphRelationMultiSelect
                label={t`Object destination`}
                dropdownId="object-destination-select"
                fullWidth
                disabled={disableRelationEdition}
                selectedObjectMetadataIds={value}
                withSearchInput={true}
                onChange={onChange}
              />
            ) : (
              <Select
                label={t`Object destination`}
                dropdownId="object-destination-select"
                fullWidth
                disabled={disableRelationEdition}
                value={value[0]}
                options={activeObjectMetadataItems
                  .filter(isObjectMetadataAvailableForRelation)
                  .sort((item1, item2) =>
                    item1.labelSingular.localeCompare(item2.labelSingular),
                  )
                  .map((objectMetadataItem) => ({
                    label: objectMetadataItem.labelPlural,
                    value: objectMetadataItem.id,
                    Icon: getIcon(objectMetadataItem.icon),
                  }))}
                onChange={(value) => {
                  onChange([value]);
                }}
              />
            )
          }
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

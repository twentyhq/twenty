import { Controller, useFormContext } from 'react-hook-form';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { type SettingsDataModelFieldMorphRelationFormValues } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationForm';
import { Select } from '@/ui/input/components/Select';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';

type JunctionOption = {
  label: string;
  value: string;
  type: 'morph' | 'relation';
};

type SettingsDataModelFieldRelationJunctionFormProps = {
  objectNameSingular: string;
};

export const SettingsDataModelFieldRelationJunctionForm = ({
  objectNameSingular,
}: SettingsDataModelFieldRelationJunctionFormProps) => {
  const { t } = useLingui();
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationType = watch('relationType') ?? RelationType.ONE_TO_MANY;
  const watchedTargetObjectIds = watch('morphRelationObjectMetadataIds');
  const junctionTargetFieldIds = watch('junctionTargetRelationFieldIds');
  const junctionMorphId = watch('junctionMorphId');

  const junctionObjectMetadataItem = useMemo(() => {
    const targetObjectIds = watchedTargetObjectIds ?? [];
    if (
      relationType !== RelationType.ONE_TO_MANY ||
      targetObjectIds.length !== 1
    ) {
      return undefined;
    }
    return objectMetadataItems.find((item) => item.id === targetObjectIds[0]);
  }, [relationType, watchedTargetObjectIds, objectMetadataItems]);

  const sourceObjectMetadataId = sourceObjectMetadataItem?.id;

  // Group MORPH_RELATION fields by morphId
  const morphGroups = useMemo(() => {
    const groups = new Map<string, FieldMetadataItem[]>();
    if (!junctionObjectMetadataItem) {
      return groups;
    }
    junctionObjectMetadataItem.fields
      .filter(
        (field) =>
          field.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(field.morphId),
      )
      .forEach((field) => {
        const existing = groups.get(field.morphId!) ?? [];
        groups.set(field.morphId!, [...existing, field]);
      });
    return groups;
  }, [junctionObjectMetadataItem]);

  // Get regular MANY_TO_ONE relation fields (not pointing back to source)
  const regularRelationFields = useMemo(() => {
    if (!junctionObjectMetadataItem) {
      return [];
    }
    return junctionObjectMetadataItem.fields.filter((field) => {
      if (
        field.type !== FieldMetadataType.RELATION ||
        field.relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return false;
      }
      if (
        isDefined(sourceObjectMetadataId) &&
        field.relation?.targetObjectMetadata.id === sourceObjectMetadataId
      ) {
        return false;
      }
      return true;
    });
  }, [junctionObjectMetadataItem, sourceObjectMetadataId]);

  // Check if junction config is enabled (either via morphId or fieldIds)
  const isJunctionConfigEnabled =
    isDefined(junctionMorphId) ||
    (isDefined(junctionTargetFieldIds) && junctionTargetFieldIds.length > 0);

  // Build options: morph groups + regular relations
  const junctionFieldOptions = useMemo(() => {
    const options: JunctionOption[] = [];

    // One option per morph group (use first field's label)
    morphGroups.forEach((fields, morphId) => {
      options.push({
        label: `${fields[0].label} (polymorphic)`,
        value: `morph:${morphId}`,
        type: 'morph' as const,
      });
    });

    // Individual options for regular MANY_TO_ONE relations
    regularRelationFields.forEach((field) => {
      options.push({
        label: field.label,
        value: `field:${field.id}`,
        type: 'relation' as const,
      });
    });

    return options;
  }, [morphGroups, regularRelationFields]);

  // Determine current selection value
  const currentSelectionValue = useMemo(() => {
    if (isDefined(junctionMorphId)) {
      return `morph:${junctionMorphId}`;
    }
    if (
      isDefined(junctionTargetFieldIds) &&
      junctionTargetFieldIds.length > 0
    ) {
      return `field:${junctionTargetFieldIds[0]}`;
    }
    return undefined;
  }, [junctionMorphId, junctionTargetFieldIds]);

  const handleJunctionToggle = (checked: boolean) => {
    if (checked && junctionFieldOptions.length > 0) {
      const firstOption = junctionFieldOptions[0];
      handleSelectionChange(firstOption.value);
    } else {
      // Clear both settings
      setValue('junctionTargetRelationFieldIds', undefined, {
        shouldDirty: true,
      });
      setValue('junctionMorphId', undefined, { shouldDirty: true });
    }
  };

  const handleSelectionChange = (selectedValue: string) => {
    if (selectedValue.startsWith('morph:')) {
      const morphId = selectedValue.replace('morph:', '');
      setValue('junctionMorphId', morphId, { shouldDirty: true });
      setValue('junctionTargetRelationFieldIds', undefined, {
        shouldDirty: true,
      });
    } else if (selectedValue.startsWith('field:')) {
      const fieldId = selectedValue.replace('field:', '');
      setValue('junctionTargetRelationFieldIds', [fieldId], {
        shouldDirty: true,
      });
      setValue('junctionMorphId', undefined, { shouldDirty: true });
    }
  };

  // Determine target label for description
  const selectedOption = junctionFieldOptions.find(
    (option) => option.value === currentSelectionValue,
  );
  const isMorphSelected = selectedOption?.type === 'morph';
  const targetObjectLabel = isMorphSelected
    ? t`linked records`
    : ((regularRelationFields[0]?.relation?.targetObjectMetadata
        ? objectMetadataItems.find(
            (item) =>
              item.id ===
              regularRelationFields[0]?.relation?.targetObjectMetadata.id,
          )?.labelPlural
        : undefined) ?? t`records`);

  // Only show for ONE_TO_MANY relations with potential junction objects, in advanced mode
  if (
    !isAdvancedModeEnabled ||
    relationType !== RelationType.ONE_TO_MANY ||
    !isDefined(junctionObjectMetadataItem) ||
    junctionFieldOptions.length === 0
  ) {
    return null;
  }

  return (
    <>
      <SettingsOptionCardContentToggle
        Icon={IconLink}
        title={t`Many-to-many`}
        description={t`Show ${targetObjectLabel} directly instead of junction record`}
        checked={isJunctionConfigEnabled}
        onChange={handleJunctionToggle}
        divider={isJunctionConfigEnabled}
        advancedMode
      />

      {isJunctionConfigEnabled && (
        <Controller
          name="junctionMorphId"
          control={control}
          render={() => (
            <SettingsOptionCardContentSelect
              title={t`Linked object`}
              description={t`The type of records to display`}
            >
              <Select
                dropdownId="junction-target-field-select"
                selectSizeVariant="small"
                dropdownWidth={120}
                value={currentSelectionValue}
                options={junctionFieldOptions}
                onChange={handleSelectionChange}
              />
            </SettingsOptionCardContentSelect>
          )}
        />
      )}
    </>
  );
};

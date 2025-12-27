import { Controller, useFormContext } from 'react-hook-form';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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

  // Get source object using objectNameSingular (works for both new and existing fields)
  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  // Watch form values - these are set by parent form's Controllers
  const relationType = watch('relationType') ?? RelationType.ONE_TO_MANY;
  const watchedTargetObjectIds = watch('morphRelationObjectMetadataIds');
  const junctionTargetFieldIds = watch('junctionTargetRelationFieldIds');

  // Get the junction object (target of the ONE_TO_MANY)
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

  // Get valid junction target fields: MANY_TO_ONE relations or MORPH_RELATION fields
  const junctionTargetFields = useMemo(() => {
    if (!junctionObjectMetadataItem) {
      return [];
    }
    return junctionObjectMetadataItem.fields.filter((field) => {
      // Allow MORPH_RELATION fields (polymorphic)
      if (field.type === FieldMetadataType.MORPH_RELATION) {
        return true;
      }
      // Allow MANY_TO_ONE RELATION fields
      if (
        field.type !== FieldMetadataType.RELATION ||
        field.relation?.type !== RelationType.MANY_TO_ONE
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
    isDefined(junctionTargetFieldIds) && junctionTargetFieldIds.length > 0;

  const handleJunctionToggle = (checked: boolean) => {
    if (checked && junctionTargetFields.length > 0) {
      setValue('junctionTargetRelationFieldIds', [junctionTargetFields[0].id], {
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
      junctionTargetFields.map((field) => {
        // For MORPH_RELATION, indicate it targets multiple objects
        const isMorph = field.type === FieldMetadataType.MORPH_RELATION;
        return {
          label: isMorph ? `${field.label} (polymorphic)` : field.label,
          value: field.id,
        };
      }),
    [junctionTargetFields],
  );

  // Get the target object name for user-friendly description
  // For MORPH fields, use a generic label
  const selectedField = junctionTargetFields.find(
    (f) => f.id === junctionTargetFieldIds?.[0],
  );
  const isMorphSelected =
    selectedField?.type === FieldMetadataType.MORPH_RELATION;

  const targetObjectMetadata =
    !isMorphSelected && junctionTargetFields[0]?.relation?.targetObjectMetadata
      ? objectMetadataItems.find(
          (item) =>
            item.id ===
            junctionTargetFields[0]?.relation?.targetObjectMetadata.id,
        )
      : undefined;
  const targetObjectLabel = isMorphSelected
    ? t`linked records`
    : (targetObjectMetadata?.labelPlural ?? t`records`);

  // Only show for ONE_TO_MANY relations with potential junction objects, in advanced mode
  if (
    !isAdvancedModeEnabled ||
    relationType !== RelationType.ONE_TO_MANY ||
    !isDefined(junctionObjectMetadataItem) ||
    junctionTargetFields.length === 0
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
          name="junctionTargetRelationFieldIds"
          control={control}
          render={({ field: { onChange, value } }) => (
            <SettingsOptionCardContentSelect
              title={t`Linked object`}
              description={t`The type of records to display`}
            >
              <Select
                dropdownId="junction-target-field-select"
                selectSizeVariant="small"
                dropdownWidth={120}
                value={value?.[0]}
                options={junctionFieldOptions}
                onChange={(selectedFieldId) => onChange([selectedFieldId])}
              />
            </SettingsOptionCardContentSelect>
          )}
        />
      )}
    </>
  );
};

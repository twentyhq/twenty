import { useFormContext } from 'react-hook-form';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Select } from '@/ui/input/components/Select';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';
import { RelationType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldRelationJunctionFormProps = {
  objectNameSingular: string;
};

export const SettingsDataModelFieldRelationJunctionForm = ({
  objectNameSingular,
}: SettingsDataModelFieldRelationJunctionFormProps) => {
  const { t } = useLingui();
  const { watch, setValue } =
    useFormContext<SettingsDataModelFieldEditFormValues>();

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationType = watch('relationType') ?? RelationType.ONE_TO_MANY;
  const targetObjectIds = watch('morphRelationObjectMetadataIds') ?? [];
  const junctionTargetFieldId = watch('settings.junctionTargetFieldId');
  const junctionTargetMorphId = watch('settings.junctionTargetMorphId');

  // Only applies to ONE_TO_MANY with single target
  if (
    !isAdvancedModeEnabled ||
    relationType !== RelationType.ONE_TO_MANY ||
    targetObjectIds.length !== 1
  ) {
    return null;
  }

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === targetObjectIds[0],
  );

  if (!junctionObjectMetadataItem) {
    return null;
  }

  const sourceObjectMetadataId = sourceObjectMetadataItem?.id;

  // Build options from junction object fields
  const junctionFieldOptions: { label: string; value: string }[] = [];

  // Group MORPH_RELATION fields by morphId
  const morphIdsSeen = new Set<string>();
  junctionObjectMetadataItem.fields
    .filter(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphId),
    )
    .forEach((field) => {
      if (!morphIdsSeen.has(field.morphId!)) {
        morphIdsSeen.add(field.morphId!);
        junctionFieldOptions.push({
          label: `${field.label} (polymorphic)`,
          value: `morph:${field.morphId}`,
        });
      }
    });

  // Add regular MANY_TO_ONE relations (not pointing back to source)
  junctionObjectMetadataItem.fields
    .filter((field) => {
      if (
        field.type !== FieldMetadataType.RELATION ||
        field.relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return false;
      }
      return (
        !isDefined(sourceObjectMetadataId) ||
        field.relation?.targetObjectMetadata.id !== sourceObjectMetadataId
      );
    })
    .forEach((field) => {
      junctionFieldOptions.push({
        label: field.label,
        value: `field:${field.id}`,
      });
    });

  if (junctionFieldOptions.length === 0) {
    return null;
  }

  const isJunctionConfigEnabled =
    isDefined(junctionTargetMorphId) || isDefined(junctionTargetFieldId);

  const currentSelectionValue = isDefined(junctionTargetMorphId)
    ? `morph:${junctionTargetMorphId}`
    : isDefined(junctionTargetFieldId)
      ? `field:${junctionTargetFieldId}`
      : undefined;

  const handleJunctionToggle = (checked: boolean) => {
    if (checked && junctionFieldOptions.length > 0) {
      handleSelectionChange(junctionFieldOptions[0].value);
    } else {
      setValue('settings.junctionTargetFieldId', undefined, {
        shouldDirty: true,
      });
      setValue('settings.junctionTargetMorphId', undefined, {
        shouldDirty: true,
      });
    }
  };

  const handleSelectionChange = (selectedValue: string) => {
    if (selectedValue.startsWith('morph:')) {
      const morphId = selectedValue.replace('morph:', '');
      setValue('settings.junctionTargetMorphId', morphId, { shouldDirty: true });
      setValue('settings.junctionTargetFieldId', undefined, {
        shouldDirty: true,
      });
    } else if (selectedValue.startsWith('field:')) {
      const fieldId = selectedValue.replace('field:', '');
      setValue('settings.junctionTargetFieldId', fieldId, {
        shouldDirty: true,
      });
      setValue('settings.junctionTargetMorphId', undefined, {
        shouldDirty: true,
      });
    }
  };

  return (
    <>
      <SettingsOptionCardContentToggle
        Icon={IconLink}
        title={t`This is a relation to a Junction Object`}
        description={t`Will show linked records directly instead of intermediate junction record`}
        checked={isJunctionConfigEnabled}
        onChange={handleJunctionToggle}
        divider={isJunctionConfigEnabled}
        advancedMode
      />

      {isJunctionConfigEnabled && (
        <SettingsOptionCardContentSelect
          title={t`Target relation on Junction Object`}
          description={t`Skip the junction object (similar to many-to-many relations)`}
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
    </>
  );
};

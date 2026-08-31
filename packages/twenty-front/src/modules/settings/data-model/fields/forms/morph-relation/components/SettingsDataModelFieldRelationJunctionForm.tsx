import { useLingui } from '@lingui/react/macro';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { isValidJunctionTargetField } from '@/object-record/record-field/ui/utils/junction/isValidJunctionTargetField';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Select } from '@/ui/input/components/Select';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RelationType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldRelationJunctionFormProps = {
  objectNameSingular: string;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldRelationJunctionForm = ({
  objectNameSingular,
  existingFieldMetadataId,
}: SettingsDataModelFieldRelationJunctionFormProps) => {
  const { t } = useLingui();
  const { watch, setValue } =
    useFormContext<SettingsDataModelFieldEditFormValues>();

  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);

  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItem: existingFieldMetadataItem } =
    useFieldMetadataItemById(existingFieldMetadataId);

  const relationType = watch('relationType') ?? RelationType.ONE_TO_MANY;
  const targetObjectIds = watch('morphRelationObjectMetadataIds') ?? [];
  const currentSettings = watch('settings');
  const junctionTargetFieldId = currentSettings?.junctionTargetFieldId;

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
  const sourceFieldMetadataId =
    existingFieldMetadataItem?.relation?.targetFieldMetadata.id ??
    existingFieldMetadataItem?.morphRelations?.find(
      ({ targetObjectMetadata }) =>
        targetObjectMetadata.id === junctionObjectMetadataItem.id,
    )?.targetFieldMetadata.id;

  // Self-referential relations cannot be junction objects
  if (sourceObjectMetadataId === junctionObjectMetadataItem.id) {
    return null;
  }

  const junctionFieldOptions: { label: string; value: string }[] = [];
  const morphIdsSeen = new Set<string>();
  for (const field of junctionObjectMetadataItem.fields) {
    if (
      !isValidJunctionTargetField({
        fieldMetadataItem: field,
        sourceFieldMetadataId,
      })
    ) {
      continue;
    }

    if (
      field.type === FieldMetadataType.MORPH_RELATION &&
      isDefined(field.morphId)
    ) {
      if (morphIdsSeen.has(field.morphId)) {
        continue;
      }
      morphIdsSeen.add(field.morphId);
    }

    junctionFieldOptions.push({
      label: `${field.label}${field.type === FieldMetadataType.MORPH_RELATION ? ' (polymorphic)' : ''}`,
      value: field.id,
    });
  }

  const isJunctionConfigEnabled = isDefined(junctionTargetFieldId);
  const isConfiguredTargetValid = junctionFieldOptions.some(
    ({ value }) => value === junctionTargetFieldId,
  );

  if (junctionFieldOptions.length === 0 && !isJunctionConfigEnabled) {
    return null;
  }

  const handleJunctionToggle = (checked: boolean) => {
    if (checked && junctionFieldOptions.length > 0) {
      setValue(
        'settings',
        {
          ...currentSettings,
          junctionTargetFieldId: junctionFieldOptions[0].value,
        },
        {
          shouldDirty: true,
        },
      );
    } else {
      setValue(
        'settings',
        {
          ...currentSettings,
          junctionTargetFieldId: undefined,
        },
        {
          shouldDirty: true,
        },
      );
    }
  };

  const handleSelectionChange = (selectedValue: string) => {
    setValue(
      'settings',
      {
        ...currentSettings,
        junctionTargetFieldId: selectedValue,
      },
      {
        shouldDirty: true,
      },
    );
  };

  return (
    <>
      <SettingsOptionCardContentToggle
        Icon={IconLink}
        title={t`This is a relation to a Junction Object`}
        description={t`Build many-to-many relations`}
        checked={isJunctionConfigEnabled}
        onChange={handleJunctionToggle}
        divider={isJunctionConfigEnabled && junctionFieldOptions.length > 0}
        advancedMode
      />

      {isJunctionConfigEnabled && junctionFieldOptions.length > 0 && (
        <SettingsOptionCardContentSelect
          title={t`Target relation on Junction Object`}
          description={t`Skip the junction object (similar to many-to-many relations)`}
        >
          <Select
            dropdownId="junction-target-field-select"
            selectSizeVariant="small"
            dropdownWidth={120}
            value={junctionTargetFieldId}
            emptyOption={
              !isConfiguredTargetValid && isDefined(junctionTargetFieldId)
                ? {
                    label: t`Select a valid target`,
                    value: junctionTargetFieldId,
                  }
                : undefined
            }
            options={junctionFieldOptions}
            onChange={handleSelectionChange}
          />
        </SettingsOptionCardContentSelect>
      )}
    </>
  );
};
